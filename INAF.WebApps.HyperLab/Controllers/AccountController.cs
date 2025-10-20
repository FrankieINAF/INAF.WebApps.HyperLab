using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Authentication;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.Libraries.Net.HyperLab.CommonWebAppHelpers;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Controllers.HyperLab;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using INAF.Libraries.Net.HyperLab.CommonModels.Resources;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class AccountController : BaseController
    {
        private readonly string ACCOUNT_ERROR_MODEL = "AccountErrorModel";
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public AccountController(IServiceProvider serviceProvider,
                                 IConfiguration configuration,
                                 ILogger<AccountController> logger,
                                 DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, configuration, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult AccountError()
        {
            AccountErrorModel? errorModel = HttpContext.Session.GetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL);
            if (errorModel == null)
                errorModel = new AccountErrorModel(Account.AccountErrorGenericTitle, Account.AccountErrorGenericMessage);
            else
                HttpContext.Session.Remove(ACCOUNT_ERROR_MODEL);

            return View(errorModel);
        }

        #region CHECK LOGIN/TOKEN
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

                var tokenValidationHelper = serviceProvider.GetRequiredService<TokenValidationHelper>();
                isValid = tokenValidationHelper.isValidToken(token);
            }
            catch (Exception ex)
            {
                logger.LogError($"{nameof(IsTokenValid)} - ex: {ex.Message}");
                isValid = false;
            }

            return new JsonResult(isValid);
        }
        #endregion

        #region LOGIN/LOGOUT
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
                    return RedirectToAction(nameof(SpectraManagerController.Hub), GenericHelper.GetControllerName(nameof(SpectraManagerController)));
            }
            else
            {
                logErrorMessage(ModelState.Values);
            }

            ModelState.Clear();
            return View();
        }

        [HttpPost]
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
            return RedirectToAction(nameof(SpectraManagerController.Hub), GenericHelper.GetControllerName(nameof(SpectraManagerController)));
        }

        public async Task<IActionResult> LogoutForJwt()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(AccountController.Login), GenericHelper.GetControllerName(nameof(AccountController)));
        }
        #endregion

        #region CONFIRMATION
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Confirmation(IncomingLoginConfirmationModel model)
        {
            /* check if token is null */
            if (string.IsNullOrEmpty(model.Token))
            {
                logger.LogWarning($"{nameof(Confirmation)} - model.Token is null");
                return RedirectToAction(nameof(ConfirmationError), GenericHelper.GetControllerName(nameof(AccountController)));
            }

            if (ModelState.IsValid)
            {
                logger.LogInformation($"{nameof(Confirmation)} - IsValid - user: {model.Id}");
                /* if login has already been confirmed, then send user to registration completed page */
                if (dbHandlerHyperLabUsers.isLoginAlreadyConfirmed(model.Token))
                    return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));

                (bool isOk, string exMsg) confirmationResult = await dbHandlerHyperLabUsers.tryConfirmLoginAsync(model.Id,
                                                                                                                 model.Token!);

                logger.LogInformation($"{nameof(Confirmation)} - IsValid - confirmationResult: isOk:{confirmationResult.isOk}, exMsg: {confirmationResult.exMsg}");
                /* if confirmation is ok, then send user to registration completed page */
                if (confirmationResult.isOk)
                {
                    /* retrieve user data to fix userId in shares and then fix them, when existant */
                    LoginModel? loginModel = dbHandlerHyperLabUsers.getLoginFromToken(model.Token);
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
        #endregion

        #region PASSWORD RESET
        // STEP 0
        /// <summary>
        /// Page for requesting password reset
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult PasswordResetRequest()
        {
            return View();
        }

        // STEP 0.5
        /// <summary>
        /// Set DB to enable sending email to user for password reset
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AutoValidateAntiforgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> PasswordResetSendEmail([FromForm] PasswordResetRequestModel model)
        {
            if (HttpContext.Session.ContainsKey(ACCOUNT_ERROR_MODEL))
                HttpContext.Session.Remove(ACCOUNT_ERROR_MODEL);

            AccountErrorModel? errorModel = null;
            if (ModelState.IsValid)
            {
                (bool isOk, AccountErrorModel? errorModel) result = await sendPasswordResetEmailAsync(model.Email!);
                if (result.isOk)
                    return RedirectToAction(nameof(PasswordResetStarted), GenericHelper.GetControllerName(nameof(AccountController)));
                else
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
            }
            else
            {
                logger.LogWarning($"{nameof(PasswordResetSendEmail)} - model NOT valid");
                logErrorMessage(ModelState.Values);
            }

            ModelState.Clear();
            errorModel = new AccountErrorModel(Account.AccountErrorGenericTitle, Account.AccountErrorGenericMessage);
            HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
            return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
        }

        [HttpPost]
        public async Task<GenericValueStringResponseModel> PasswordResetSendEmailForApp([FromBody] PasswordResetRequestModel model)
        {
            if (HttpContext.Session.ContainsKey(ACCOUNT_ERROR_MODEL))
                HttpContext.Session.Remove(ACCOUNT_ERROR_MODEL);

            if (ModelState.IsValid)
            {
                (bool isOk, AccountErrorModel? errorModel) result = await sendPasswordResetEmailAsync(model.Email!);
                if (result.isOk)
                    return GenericValueStringResponseModel.CreateSuccessResponse();
                else
                    return GenericValueStringResponseModel.CreateErrorResponse(result.errorModel?.ErrorMessage ?? string.Empty);
            }
            else
            {
                logger.LogWarning($"{nameof(PasswordResetSendEmail)} - model NOT valid");
                logErrorMessage(ModelState.Values);
            }

            ModelState.Clear();
            return GenericValueStringResponseModel.CreateErrorResponse(Account.AccountErrorGenericMessage);
        }

        // STEP 1
        /// <summary>
        /// Page for warn user that an email will be sent to set the new password
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult PasswordResetStarted()
        {
            return View();
        }

        // STEP 2
        /// <summary>
        /// Page for inserting the new password
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult PasswordResetExecute(IncomingLoginConfirmationModel model)
        {
            AccountErrorModel? errorModel = null;

            /* check if token is null */
            if (string.IsNullOrEmpty(model.Token))
            {
                logger.LogWarning($"{nameof(PasswordResetExecute)} - model.Token is null");
                errorModel = new AccountErrorModel(Account.PasswordResetErrorTokenTitle, Account.PasswordResetErrorNullTokenMessage);
                HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
            }

            if (ModelState.IsValid)
            {
                /* check if provided token is waiting for password reset */
                logger.LogInformation($"{nameof(PasswordResetExecute)} - IsValid - user: {model.Id}");
                if (!dbHandlerHyperLabUsers.isLoginWaitingForPasswordReset(model.Token))
                {
                    errorModel = new AccountErrorModel(Account.PasswordResetErrorEmailNotSetForResetTitle, Account.PasswordResetErrorEmailNotSetForResetMessage);
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
                }

                /* try to retrieve login from token */
                LoginModel? loginModel = dbHandlerHyperLabUsers.getLoginForPasswordResetFromToken(model.Token);
                if (loginModel == null)
                {
                    logger.LogError($"{nameof(PasswordResetExecute)} - loginModel is null - user: {model.Token}");
                    errorModel = new AccountErrorModel(Account.PasswordResetErrorTokenTitle, Account.PasswordResetErrorInvalidTokenMessage);
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
                }

                return View(new PasswordResetModel() { Email = loginModel.UserName });
            }

            logger.LogInformation($"{nameof(PasswordResetExecute)} - NOT VALID - user: {model.Id}");
            return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
        }

        // STEP 2.5
        /// <summary>
        /// Set new password for user
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AutoValidateAntiforgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> PasswordReset([FromForm] PasswordResetModel model)
        {
            clearErrorsForKey(nameof(PasswordResetModel.Email));
            //ModelState.ClearValidationState(nameof(PasswordResetModel.Email));

            if (ModelState.IsValid)
            {
                logger.LogInformation($"{nameof(PasswordReset)} - email: {model.Email}");
                GenericValueStringResponseModel response = await resetPasswordAsync(model);
                if (response.IsOk)
                    return RedirectToAction(nameof(PasswordResetCompleted), GenericHelper.GetControllerName(nameof(AccountController)));
            }
            else
            {
                logErrorMessage(ModelState.Values);
            }

            ModelState.Clear();
            return View();
        }

        // STEP 3
        /// <summary>
        /// Page to warn user about password change completed
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult PasswordResetCompleted()
        {
            return View();
        }
        #endregion

        #region REGISTRATION
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
                {
                    if (string.IsNullOrEmpty(response.ExMsg))
                        return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));
                    else
                    {
                        ViewBag.Confirmation = 1;
                        return RedirectToAction(nameof(RegistrationConfirmed), GenericHelper.GetControllerName(nameof(AccountController)));
                    }
                }
                else
                {
                    AccountErrorModel errorModel = new AccountErrorModel(Account.ConfirmationErrorTitle, response.ExMsg);
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
                }
            }

            logErrorMessage(ModelState.Values);
            ModelState.Clear();
            return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
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
        #endregion

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
            /* if no data has been passed, then an error is raised */
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.LastName) || string.IsNullOrEmpty(model.Email))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = INAF.Libraries.Net.CommonWebAppModels.Resources.Login.RegistrationBadRequest };

            /* if user has a valid login then no action is required */
            if (dbHandlerHyperLabUsers.isUserExistantAndValidLogin(model.Name, model.LastName, model.Email))
                return new GenericValueStringResponseModel() { IsOk = true, ExMsg = Resources.Users.UserAlreadyExistantMessage };

            /* encrypt password */
            string encryptedPassword = getEncrypted(model.Password!);

            /* generate confirmation token */
            string confirmationToken = Guid.NewGuid().ToString();

            /* set token expiration date */
            string tokenExpiration = configuration!.GetSection("AppSettings:ConfirmationToken:TokenTimeoutDays").Value ?? "1";
            DateTime tokenExpirationDateTime = DateTime.UtcNow.AddDays(int.Parse(tokenExpiration));

            /* save new user */
            if (await dbHandlerHyperLabUsers.upsertUserProcedureAsync(id: model.Id,
                                                                      name: model.Name.ToLowerInvariant().FirstCharToUpperCase(),
                                                                      lastName: model.LastName.ToLowerInvariant().FirstCharToUpperCase(),
                                                                      userName: model.Email.ToLowerInvariant(),
                                                                      email: model.Email.ToLowerInvariant(),
                                                                      encryptedPassword: encryptedPassword,
                                                                      confirmationToken: confirmationToken,
                                                                      tokenExpirationDateTime: tokenExpirationDateTime,
                                                                      roleId: (int)INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums.RoleType.User,
                                                                      operationUserId: getUserId()))
                return new GenericValueStringResponseModel() { IsOk = true };
            else
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = INAF.Libraries.Net.CommonWebAppModels.Resources.Login.RegistrationBadRequest };
        }

        private async Task<GenericValueStringResponseModel> resetPasswordAsync(PasswordResetModel model)
        {
            if (string.IsNullOrEmpty(model.Email))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Account.PasswordResetRequestBadRequest };

            if (!dbHandlerHyperLabUsers.isUserExistant(model.Email))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Users.UserNotExistantErrorMessage };

            /* encrypt password */
            string encryptedPassword = getEncrypted(model.Password!);

            /* generate confirmation token and set token expiration date-time */
            string passwordResetToken = Guid.NewGuid().ToString();

            /* update db */
            if (await dbHandlerHyperLabUsers.resetPasswordAsync(model.Email,
                                                                encryptedPassword))
                return new GenericValueStringResponseModel() { IsOk = true };
            else
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Account.PasswordResetRequestBadModel };
        }

        private async Task<(bool isOk, AccountErrorModel? errorModel)> sendPasswordResetEmailAsync(string email)
        {
            AccountErrorModel? errorModel = null;

            if (!dbHandlerHyperLabUsers.isLoginExistantForPasswordReset(email))
            {
                errorModel = new AccountErrorModel(Account.PasswordResetErrorEmailNotExistantTitle, Account.PasswordResetErrorEmailNotExistantMessage);
                
                if (getCallerContext() == Enums.CallerContext.Web)
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);

                return (false, errorModel);
            }

            logger.LogInformation($"{nameof(PasswordResetSendEmail)} - email: {email}");
            GenericValueStringResponseModel response = await setUserLoginForPasswordResetAsync(email);

            if (response.IsOk)
                return (true, null);

            errorModel = new AccountErrorModel(Account.AccountErrorGenericTitle, response.ExMsg);
            
            if (getCallerContext() == Enums.CallerContext.Web)
                HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);

            return (false, errorModel);
        }

        private async Task<GenericValueStringResponseModel> setUserLoginForPasswordResetAsync(string email)
        {
            if (string.IsNullOrEmpty(email))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Account.PasswordResetRequestBadRequest };

            if (!dbHandlerHyperLabUsers.isUserExistant(email!))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Users.UserNotExistantErrorMessage };

            if (!dbHandlerHyperLabUsers.isUserExistantAndValidLogin(email!))
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Users.UserNotConfirmedErrorMessage };

            /* generate confirmation token and set token expiration date-time */
            string passwordResetToken = Guid.NewGuid().ToString();

            DateTime tokenExpirationDateTime = DateTime.UtcNow.AddHours(1);

            /* update db */
            if (await dbHandlerHyperLabUsers.setPasswordForResetAsync(email,
                                                                      passwordResetToken,
                                                                      tokenExpirationDateTime))
                return new GenericValueStringResponseModel() { IsOk = true };
            else
                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Account.PasswordResetRequestBadModel };
        }
        #endregion
    }
}
