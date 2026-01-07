using INAF.Libraries.Net.CommonResources;
using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Extensions;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Values;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class AccountController : BaseController
    {
        private readonly string ACCOUNT_ERROR_MODEL = "AccountErrorModel";
        private readonly AuthorizationHelper authorizationHelper;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public AccountController(IServiceProvider serviceProvider,
                                 IConfiguration configuration,
                                 ILogger<AccountController> logger,
                                 AuthorizationHelper authorizationHelper,
                                 DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, configuration, logger)
        {
            this.authorizationHelper = authorizationHelper;
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
        public async Task<JsonResult> IsUserTokenValid()
        {
            string? userToken = HttpContext.GetToken();
            if (userToken == null)
                return new JsonResult(false);

            bool isValid = await authorizationHelper.isUserTokenValid(userToken);

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

                UserModel? user = await authorizationHelper.loginAsync(model.ToJwtLoginModel(), HttpContext.RequestAborted);
                logger.LogInformation($"{nameof(Login)} - isAuthenticated: {user != null}");
                if (user == null)
                {
                    logger.LogError($"{nameof(Login)} - user is null after authentication - user: {model.UserName}");
                    ModelState.Clear();
                    return View();
                }

                if (user.Login == null || !user.Login.IsAuthorized)
                {
                    logger.LogError($"{nameof(Login)} - user is not authorized - user: {model.UserName}");
                    ModelState.Clear();
                    return View();
                }

                /* set session token */
                if (!string.IsNullOrEmpty(user.Token))
                    HttpContext.Session.SetString(Constants.USER_TOKEN, user.Token);

                /* add cookie auth for web access */
                var identity = new ClaimsIdentity(new[] {
                            new Claim(ClaimTypes.Name, user.getCompleteName()),
                            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                        }, CookieAuthenticationDefaults.AuthenticationScheme);

                var principal = new ClaimsPrincipal(identity);

                if (model.RememberMe)
                {
                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
                    {
                        AllowRefresh = true,
                        IsPersistent = model.RememberMe,
                        IssuedUtc = DateTime.UtcNow
                    });
                }
                else
                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

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
                UserModel? user = await authorizationHelper.loginAsync(model, HttpContext.RequestAborted);
                logger.LogInformation($"{nameof(Login)} - isAuthenticated: {user != null}");

                if (user == null)
                    return new JsonResult(JwtTokenModel.GetEmptyToken());

                JwtTokenModel? jwtTokenModel = await authorizationHelper.getTokenForUserAsync(user.Id);
                if (jwtTokenModel == null)
                    return new JsonResult(JwtTokenModel.GetEmptyToken());

                return new JsonResult(jwtTokenModel);
            }

            logErrorMessage(ModelState.Values);
            return new JsonResult(JwtTokenModel.GetEmptyToken());
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            if (await authorizationHelper.logoutAsync(await getUserIdAsync()))
            {
                logger.LogInformation($"{nameof(Logout)} - user logged out: {getUserIdAsync().Result}");
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
            else
                logger.LogWarning($"{nameof(Logout)} - error logging out user: {getUserIdAsync().Result}");

            return RedirectToAction(nameof(SpectraManagerController.Hub), GenericHelper.GetControllerName(nameof(SpectraManagerController)));
        }

        public async Task<IActionResult> LogoutForJwt()
        {
            bool isLoggedOut = await authorizationHelper.logoutAsync(await getUserIdAsync());
            if (isLoggedOut)
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
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
                if (await authorizationHelper.isLoginAlreadyConfirmedAsync(model.Token))
                    return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));

                bool isOk = await authorizationHelper.confirmLoginAsync(model.Id, model.Token!);

                logger.LogInformation($"{nameof(Confirmation)} - IsValid - confirmationResult: isOk:{isOk}");
                /* if confirmation is ok, then send user to registration completed page */
                if (isOk)
                {
                    /* retrieve user data to fix userId in shares and then fix them, when existant */
                    LoginModel? loginModel = await authorizationHelper.getLoginFromTokenAsync(model.Token);
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
                GenericValueStringResponseModel response = await authorizationHelper.passwordResetSendEmailAsync(model);
                if (response.IsOk)
                    return RedirectToAction(nameof(PasswordResetStarted), GenericHelper.GetControllerName(nameof(AccountController)));
                else
                {
                    logger.LogError($"{nameof(PasswordResetSendEmail)} - error sending password reset email - email: {model.Email} - error: {response.ExMsg}");
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
                }
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
                GenericValueStringResponseModel response = await authorizationHelper.passwordResetSendEmailAsync(model);
                if (response.IsOk)
                    return GenericValueStringResponseModel.CreateSuccessResponse();
                else
                    return GenericValueStringResponseModel.CreateErrorResponse(response.ExMsg ?? string.Empty);
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
        public async Task<IActionResult> PasswordResetExecute(IncomingLoginConfirmationModel model)
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
                GenericResponseModel response = await authorizationHelper.passwordResetExecuteAsync(model);
                if (!string.IsNullOrEmpty(response.ExMsg))
                {
                    logger.LogError($"{nameof(PasswordResetExecute)} - error in password reset execute - token: {model.Token} - error: {response.ExMsg}");
                    errorModel = new AccountErrorModel(Account.AccountErrorGenericTitle, response.ExMsg);
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));

                }

                string? userName = string.Empty;
                if (response.ResponseObject is JsonElement el && el.ValueKind == JsonValueKind.String)
                    userName = el.GetString();
                else
                {
                    logger.LogError($"{nameof(PasswordResetExecute)} - response.ResponseObject is null or not LoginModel - user: {model.Id}");
                    errorModel = new AccountErrorModel(Account.AccountErrorGenericTitle, Account.AccountErrorGenericMessage);
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
                }

                return View(new PasswordResetModel() { Email = userName });
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
                GenericValueStringResponseModel response = await authorizationHelper.passwordResetAsync(model);
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
                RegistrationStatusResponseModel? response = await authorizationHelper.registerAsync(model, HttpContext.RequestAborted);
                if (response == null)
                {
                    AccountErrorModel errorModel = new AccountErrorModel(Account.AccountErrorGenericTitle, Account.AccountErrorGenericMessage);
                    HttpContext.Session.SetObject<AccountErrorModel>(ACCOUNT_ERROR_MODEL, errorModel);
                    return RedirectToAction(nameof(AccountError), GenericHelper.GetControllerName(nameof(AccountController)));
                }


                switch (response.Status)
                {
                    case Libraries.Net.CommonWebAppModels.Values.Enums.RegistrationStatus.Registered:
                        if (string.IsNullOrEmpty(response.ExMsg))
                            return RedirectToAction(nameof(RegistrationCompleted), GenericHelper.GetControllerName(nameof(AccountController)));
                        else
                        {
                            ViewBag.Confirmation = 1;
                            return RedirectToAction(nameof(RegistrationConfirmed), GenericHelper.GetControllerName(nameof(AccountController)));
                        }

                    case Libraries.Net.CommonWebAppModels.Values.Enums.RegistrationStatus.Error:
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
                RegistrationStatusResponseModel? response = await authorizationHelper.registerAsync(model, HttpContext.RequestAborted);
                if (response == null)
                    return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Account.AccountErrorGenericMessage };

                switch (response.Status)
                {
                    case Libraries.Net.CommonWebAppModels.Values.Enums.RegistrationStatus.Registered:
                        return new GenericValueStringResponseModel() { IsOk = true, Value = response.ExMsg ?? string.Empty };
                    case Libraries.Net.CommonWebAppModels.Values.Enums.RegistrationStatus.Error:
                        return new GenericValueStringResponseModel() { IsOk = false, ExMsg = response.ExMsg };
                }

                return new GenericValueStringResponseModel() { IsOk = false, ExMsg = Account.AccountErrorGenericMessage };
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
    }
}
