using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Authentication;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.Libraries.Net.Extensions;
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
using INAF.Libraries.Net.DB.HyperLabData;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class AccountController : BaseController
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public AccountController(IServiceProvider serviceProvider,
                                 IConfiguration configuration,
                                 ILogger<AccountController> logger,
                                 DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, configuration, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpGet]
        public JsonResult IsLoginValid()
        {
            return new JsonResult(dbHandlerHyperLabUsers.isLoginValid(getUserId()));
        }

        [HttpGet]
        public JsonResult IsTokenValid()
        {
            bool isValid = false;

            try
            {
                string? token = HttpContext.GetToken();

                if (string.IsNullOrEmpty(token))
                    return new JsonResult(isValid);

                if (!dbHandlerHyperLabUsers.isTokenValid(token))
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
        public async Task<IActionResult> Confirmation(IncomingLoginConfirmationModel model)
        {
            if (ModelState.IsValid)
            {
                logger.LogInformation($"{nameof(Confirmation)} - IsValid - user: {model.Id}");
                /* if login has already been confirmed, then send user to registration completed page */
                if (dbHandlerHyperLabUsers.isLoginAlreadyConfirmed(model.Id))
                    return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));

                (bool isOk, string exMsg) confirmationResult = await dbHandlerHyperLabUsers.tryConfirmLoginAsync(model.Id,
                                                                                                                 model.Token!);

                logger.LogInformation($"{nameof(Confirmation)} - IsValid - confirmationResult: isOk:{confirmationResult.isOk}, exMsg: {confirmationResult.exMsg}");
                /* if confirmation is ok, then send user to registration completed page */
                if (confirmationResult.isOk)
                {
                    /* retrieve user data to fix userId in shares and then fix them, when existant */
                    LoginModel? loginModel = dbHandlerHyperLabUsers.getUserDataForShareFromLoginId(model.Id);
                    if (loginModel != null)
                    {
                        var dbHandlerHyperLabData = serviceProvider.GetRequiredService<DbHandlerHyperLabData>();
                        await dbHandlerHyperLabData.fixSharesForNewUser(loginModel.Id, loginModel.UserName!);
                    }

                    ViewBag.Confirmation = 1;
                    return RedirectToAction(nameof(RegistrationConfirmed), GenericHelper.GetControllerName(nameof(AccountController)));
                }

                /* if confirmation is not ok, then send user to confirmation error page */
                return RedirectToAction(nameof(ConfirmationError), GenericHelper.GetControllerName(nameof(AccountController)));
            }

            logger.LogInformation($"{nameof(Confirmation)} - NOT VALID - user: {model.Id}");
            return RedirectToAction(nameof(ConfirmationError), GenericHelper.GetControllerName(nameof(AccountController)));
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult ConfirmationError()
        {
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login(string? returnUrl,
                                   string? caller = null)
        {
            ViewBag.ReturnUrl = returnUrl;
            if (!string.IsNullOrEmpty(caller))
                ViewBag.Caller = caller;
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
                (bool isAuthenticated, UserModel? user) result = await tryAuthenticateForWebAsync(model.UserName!, model.Password!, model.RememberMe);
                logger.LogInformation($"{nameof(Login)} - isAuthenticated: {result.isAuthenticated}");
                if (result.isAuthenticated)
                    return RedirectToAction(nameof(SLabDataManagerController.Search), GenericHelper.GetControllerName(nameof(SLabDataManagerController)));
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

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Registration()
        {
            return View();
        }

        [HttpPost]
        [AutoValidateAntiforgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> Registration([FromForm] RegistrationModel model)
        {
            if (ModelState.IsValid)
            {
                GenericValueStringResponseModel response = await registerAsync(model);
                if (response.IsOk)
                    return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));
                else
                    return new JsonResult(response);
            }
            else
            {
                logErrorMessage(ModelState.Values);
                ModelState.Clear();
                return new BadRequestResult();
            }
        }

        [HttpPost]
        public async Task<GenericValueStringResponseModel> RegistrationFromApp([FromBody] RegistrationModel model)
        {
            if (ModelState.IsValid)
            {
                return await registerAsync(model);
            }
            else
            {
                logErrorMessage(ModelState.Values);
                ModelState.Clear();
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = INAF.Libraries.Net.CommonWebAppModels.Resources.Login.RegistrationBadModel };
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult RegistrationCompleted()
        {
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult RegistrationConfirmed()
        {
            return View();
        }

        #region PRIVATE
        private async Task<JwtTokenModel> createNewTokenForUserAsync(UserModel user)
        {
            using RSA rsa = RSA.Create();
            rsa.ImportRSAPrivateKey( // Convert the loaded key from base64 to bytes.
                source: Convert.FromBase64String(configuration[$"{appPrefixForUserSecrets}:JwtToken:PrivateKey"]), // Use the private key to sign tokens
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

            string oldtokenstring = dbHandlerHyperLabUsers.getTokenFromUserId(user.Id);

            if (string.IsNullOrEmpty(oldtokenstring))
            {
                /* save user-token relationship in DB */
                await dbHandlerHyperLabUsers.saveUserTokenAsync(user.Id,
                                                                tokenstring,
                                                                user.Id);
            }
            else
            {
                /* save user-token relationship in DB */
                await dbHandlerHyperLabUsers.updateUserTokenAsync(user.Id,
                                                                  tokenstring);
            }


            /* return result */
            return new JwtTokenModel(tokenstring, user.CompleteName, token.ValidTo);
        }

        private async Task getTokenAsync(string? code = null)
        {
            try
            {
                /* create request model for retrieving suggestions for current text */
                var parameters = new Dictionary<string, string> {
                    { "client_id", "APP-28MJC162XY2CSSCT" },
                    { "client_secret", "77ae6944-8fe5-41fe-904c-17b6583f70d7" },
                    { "grant_type", "authorization_code" },
                    { "redirect_uri", "/Account/ExternalLoginCallback" },
                    { "code", code! }
                };

                var encodedContent = new FormUrlEncodedContent(parameters);

                /* retrieve url for querying web service */
                var url = "https://orcid.org/oauth/token";

                /* send request to web service */
                using (var httpClient = new HttpClient())
                {
                    using (var response = await httpClient.PostAsync(new Uri(url), encodedContent))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            string responseContent = await response.Content.ReadAsStringAsync();
                            System.Diagnostics.Debug.WriteLine($"responseContent: {responseContent}");
                        }
                        else
                        {
                            string errorContent = await response.Content.ReadAsStringAsync();
                            logger.LogError($"Error in {nameof(getTokenAsync)}: {errorContent}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"{nameof(getTokenAsync)} - ex: {ex.Message}");
            }
        }

        private async Task<JwtTokenModel> tryAuthenticateForJwtAsync(JwtLoginModel model)
        {
            /* try to authenticate user by username/password */
            (bool isAuthenticated, UserModel? user) resultForWeb = await tryAuthenticateForWebAsync(model.UserName, model.Password);

            if (resultForWeb.user == null)
                return JwtTokenModel.GetEmptyToken();

            if (resultForWeb.isAuthenticated)
            {
                string existingtokenstring = dbHandlerHyperLabUsers.getTokenFromUserId(resultForWeb.user.Id);
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
            user = dbHandlerHyperLabUsers.tryLogin(userName, encryptedPwd);
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

        private async Task<GenericValueStringResponseModel> registerAsync(RegistrationModel model)
        {
            if (dbHandlerHyperLabUsers.isUserExistant(model.Email!))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Users.UserAlreadyExistantMessage };

            /* encrypt password */
            string encryptedPassword = getEncrypted(model.Password!);

            /* generate confirmation token */
            string confirmationToken = Guid.NewGuid().ToString();

            /* set token expiration date */
            string tokenExpiration = configuration!.GetSection("AppSettings:ConfirmationToken:TokenTimeoutDays").Value ?? "1";
            DateTime tokenExpirationDateTime = DateTime.UtcNow.AddDays(int.Parse(tokenExpiration));

            /* save new user */
            if (await dbHandlerHyperLabUsers.upsertUserProcedureAsync(id: model.Id,
                                                                      name: model.Name!.ToLowerInvariant().FirstCharToUpperCase(),
                                                                      lastName: model.LastName!.ToLowerInvariant().FirstCharToUpperCase(),
                                                                      userName: model.Email.ToLowerInvariant(),
                                                                      email: model.Email.ToLowerInvariant(),
                                                                      encryptedPassword: encryptedPassword,
                                                                      confirmationToken: confirmationToken,
                                                                      tokenExpirationDateTime: tokenExpirationDateTime,
                                                                      roleId: (int)INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums.RoleType.User,
                                                                      operationUserId: getUserId()))
                return new GenericValueStringResponseModel() { IsOk = true };
            //return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));
            else
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = INAF.Libraries.Net.CommonWebAppModels.Resources.Login.RegistrationBadRequest };
        }
        #endregion
    }
}
