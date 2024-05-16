using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Authentication;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers.Factories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class AccountController : BaseController
    {
        public AccountController(IServiceProvider serviceProvider,
                                 IConfiguration configuration,
                                 DbHandler dbHandler,
                                 ILogger<BaseController> logger) : base(serviceProvider, configuration, dbHandler, logger)
        { }

        [HttpGet]
        public JsonResult IsLoginValid()
        {
            return new JsonResult(dbHandler.isLoginValid(getUserId()));
        }

        [HttpGet]
        public JsonResult IsTokenValid()
        {
            bool isValid = false;

            try
            {
                string token = HttpContext.GetToken();

                if (!dbHandler.isTokenValid(token))
                    return new JsonResult(isValid);

                TokenValidationParametersFactory tokenValidationParametersFactory = serviceProvider.GetRequiredService<TokenValidationParametersFactory>();
                TokenValidationParameters tokenValidationParameters = tokenValidationParametersFactory.getTokenValidationParameters();
                ISecurityTokenValidator tokenValidator = new JwtSecurityTokenHandler();
                var claim = tokenValidator.ValidateToken(token, tokenValidationParameters, out _);
                if (claim != null)
                {
                    var scope = claim.FindFirst(c => c.Type.ToLower() == "exp").Value;
                    double expirationUnixTime = scope.ToDoubleInvariant();
                    DateTime expirationDateTime = expirationUnixTime.UnixTimeStampToDateTime();
                    if (DateTime.UtcNow < expirationDateTime)
                        isValid = true;
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"{nameof(IsTokenValid)} - ex: {ex.Message}");
                isValid = false;
            }

            return new JsonResult(isValid);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        [HttpPost]
        [AutoValidateAntiforgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromForm] LoginModel model)
        {
            /* remove error for ConfirmPassword, not used in login form*/
            clearErrorsForKey($"{nameof(LoginModel.ConfirmPassword)}");
            if (ModelState.IsValid)
            {
                logger.LogInformation($"{nameof(Login)} - user: {model.UserName}");
                (bool isAuthenticated, UserModel user) result = await tryAuthenticateForWebAsync(model.UserName, model.Password, model.RememberMe);
                logger.LogInformation($"{nameof(Login)} - isAuthenticated: {result.isAuthenticated}");
                if (result.isAuthenticated)
                    return RedirectToAction("Search", "Searches");
                //return RedirectToHomeView(returnUrl);
            }
            else
            {
                logErrorMessage(ModelState.Values);
            }

            ModelState.Clear();
            return View();
        }

        public async Task<IActionResult> LoginForJwt([FromBody] JwtLoginModel model)
        {
            if (ModelState.IsValid)
            {
                return new JsonResult(await tryAuthenticateForJwtAsync(model));
            }
            else
            {
                logErrorMessage(ModelState.Values);
            }

            ModelState.Clear();
            return View();
        }

        #region methods
        private async Task<JwtTokenModel> createNewTokenForUserAsync(UserModel user)
        {
            using RSA rsa = RSA.Create();
            rsa.ImportRSAPrivateKey( // Convert the loaded key from base64 to bytes.
                source: Convert.FromBase64String(configuration["AppSettings:JwtToken:PrivateKey"]), // Use the private key to sign tokens
                bytesRead: out int _); // Discard the out variable 

            var signingCredentials = new SigningCredentials(
                key: new RsaSecurityKey(rsa),
                algorithm: SecurityAlgorithms.RsaSha256 // Important to use RSA version of the SHA algo 
            );


            string nameIdentifier = string.Join(string.Empty, user.Name, user.LastName, user.Id);

            /* generate a new token for user */
            var token = new JwtSecurityToken(audience: configuration.GetSection("AppSettings:JwtToken:Audience").Value,
                                             issuer: configuration.GetSection("AppSettings:JwtToken:Issuer").Value,
                                             claims: new Claim[] { new Claim(ClaimTypes.NameIdentifier, nameIdentifier) },
                                             notBefore: DateTime.UtcNow,
                                             expires: DateTime.UtcNow.AddDays(int.Parse(configuration.GetSection("AppSettings:JwtToken:TokenTimeoutDays").Value)),
                                             signingCredentials: signingCredentials);


            /* extract token string */
            string tokenstring = new JwtSecurityTokenHandler().WriteToken(token);

            string oldtokenstring = dbHandler.getTokenFromUserId(user.Id);

            if (string.IsNullOrEmpty(oldtokenstring))
            {
                /* save user-token relationship in DB */
                await dbHandler.saveUserTokenAsync(user.Id,
                                                   tokenstring,
                                                   user.Id);
            }
            else
            {
                /* save user-token relationship in DB */
                await dbHandler.updateUserTokenAsync(user.Id,
                                                     tokenstring);
            }


            /* return result */
            return new JwtTokenModel(tokenstring, user.getCompleteName(), token.ValidTo);
        }

        private async Task<JwtTokenModel> tryAuthenticateForJwtAsync(JwtLoginModel model)
        {
            /* try to authenticate user by username/password */
            (bool isAuthenticated, UserModel user) resultForWeb = await tryAuthenticateForWebAsync(model.UserName, model.Password);

            if (resultForWeb.isAuthenticated)
            {
                string existingtokenstring = dbHandler.getTokenFromUserId(resultForWeb.user.Id);
                if (!string.IsNullOrEmpty(existingtokenstring))
                {
                    var securityToken = new JwtSecurityToken(existingtokenstring);

                    if (DateTime.UtcNow >= securityToken.ValidTo)
                        return await createNewTokenForUserAsync(resultForWeb.user);

                    /* return result */
                    return new JwtTokenModel(existingtokenstring, resultForWeb.user.getCompleteName(), securityToken.ValidTo);
                }
                else
                    return await createNewTokenForUserAsync(resultForWeb.user);
            }

            return JwtTokenModel.GetEmptyToken();
        }

        private async Task<(bool isAuthenticated, UserModel? user)> tryAuthenticateForWebAsync(string userName,
                                                                                              string password,
                                                                                              bool rememberMe = false)
        {
            bool isAuthenticated = false;
            UserModel? user = null;

            string encryptedPwd = getEncrypted(password);
            user = dbHandler.tryLogin(userName, encryptedPwd);
            if (user != null)
            {
                /* add cookie auth for web access */
                var identity = new ClaimsIdentity(new[] {
                            new Claim(ClaimTypes.Name, user.getCompleteName()),
                            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                        }, CookieAuthenticationDefaults.AuthenticationScheme);

                var principal = new ClaimsPrincipal(identity);

                if (rememberMe)
                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
                    {
                        AllowRefresh = true,
                        IsPersistent = rememberMe,
                        IssuedUtc = DateTime.UtcNow
                    });
                else
                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

                isAuthenticated = true;
            }

            return (isAuthenticated, user);
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(AccountController.Login), GenericHelper.GetControllerName(nameof(AccountController)));
        }

        public async Task<IActionResult> LogoutForJwt()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(AccountController.Login), GenericHelper.GetControllerName(nameof(AccountController)));
        }
        #endregion
    }
}
