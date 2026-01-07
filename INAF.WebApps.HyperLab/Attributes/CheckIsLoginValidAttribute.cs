using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonWebAppHelpers;
using INAF.WebApps.HyperLab.Controllers;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Values;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace INAF.WebApps.HyperLab.Attributes
{
    public class CheckIsLoginValidAttribute : ActionFilterAttribute
    {
        public override async void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var authorizationHelper = filterContext.HttpContext.RequestServices.GetRequiredService<AuthorizationHelper>();
            var tokenValidationHelper = filterContext.HttpContext.RequestServices.GetRequiredService<TokenValidationHelper>();
            var logger = filterContext.HttpContext.RequestServices.GetRequiredService<ILogger<CheckIsLoginValidAttribute>>();

            /* retrieve token from 'Authorization' header (App) */
            string? token = filterContext.HttpContext.GetToken();
            if (string.IsNullOrEmpty(token))
            {
                /* if no token is found in 'Authorization' header (App), then recover it from session (web app):
                 * it has been saved on login */
                token = filterContext.HttpContext.Session.GetString(Constants.USER_TOKEN);

                if (string.IsNullOrEmpty(token))
                {
                    int userId = filterContext.HttpContext.GetUserId();
                    JwtTokenModel? jwtToken = await authorizationHelper.getTokenForUserAsync(userId);
                    if (jwtToken != null)
                        token = jwtToken.Token;
                }
                
            }

            if (string.IsNullOrEmpty(token) || !tokenValidationHelper.isValidToken(token))
            {
                if (!string.IsNullOrEmpty(token))
                    logger.LogWarning("Invalid or expired token detected. Redirecting to login page.");
                else 
                    logger.LogWarning("No token found. Redirecting to login page.");

                filterContext.Result = new RedirectResult(GenericHelper.GetUrl(GenericHelper.GetControllerName(nameof(AccountController)), nameof(AccountController.Login)));
                return;
            }

            string expirationTokenString = filterContext.HttpContext.Session.GetString(Constants.USER_TOKEN_EXPIRATION_DATETIME) ?? string.Empty;
            if (!string.IsNullOrEmpty(expirationTokenString))
            {
                if (DateTime.TryParse(expirationTokenString, out DateTime expirationDateTime))
                {
                    if (DateTime.UtcNow < expirationDateTime)
                    {
                        // Token is still valid according to session expiration time
                        return;
                    }
                }
            }

            /* redirect to action depending on login */
            bool isLoginValid = await authorizationHelper.isLoginValidAsync(token);
            if (isLoginValid)
            {
                DateTime expirationDateTime = tokenValidationHelper.getExpirationDateTime(token);
                filterContext.HttpContext.Session.SetString(Constants.USER_TOKEN_EXPIRATION_DATETIME, expirationDateTime.ToString("o"));
            }
            if (!isLoginValid)
            {
                filterContext.Result = new RedirectResult(GenericHelper.GetUrl(GenericHelper.GetControllerName(nameof(AccountController)), nameof(AccountController.Login)));
                logger.LogWarning("Login is not valid. Redirecting to login page.");
            }
        }
    }
}
