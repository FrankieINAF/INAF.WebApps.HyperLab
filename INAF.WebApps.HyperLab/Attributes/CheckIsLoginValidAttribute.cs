using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.CommonWebAppModels.Values;
using INAF.WebApps.HyperLab.Controllers;
using INAF.WebApps.HyperLab.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace INAF.WebApps.HyperLab.Attributes
{
    public class CheckIsLoginValidAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var authorizationHelper = context.HttpContext.RequestServices.GetRequiredService<AuthorizationHelper>();
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<CheckIsLoginValidAttribute>>();

            int userId = await context.HttpContext.GetUserIdAsync();

            if (userId <= 0)
            {
                handleUnauthorizedAccess(context, logger, "No token found. Redirecting to login page.");
                return;
            }

            /* if the expiration-date has already been saved in session, use it */
            string expirationTokenString = context.HttpContext.Session.GetString(Constants.USER_TOKEN_EXPIRATION_DATETIME) ?? string.Empty;
            if (!string.IsNullOrEmpty(expirationTokenString))
            {
                if (DateTime.TryParse(expirationTokenString, out DateTime expirationDateTime))
                {
                    if (DateTime.UtcNow < expirationDateTime)
                    {
                        // Token is still valid according to session expiration time
                        await next();
                        return;
                    }
                    else
                    {
                        handleUnauthorizedAccess(context, logger, "Login is not valid. Redirecting to login page.");
                        return;
                    }
                }
            }

            /* if expiration-date has not yet been saved... */
            /* 1) retrieve token from 'Authorization' header (App) */
            string? token = context.HttpContext.GetToken();
            if (string.IsNullOrEmpty(token))
            {
                /* if no token is found in 'Authorization' header (App), then recover it from session (web app):
                 * it has been saved on login */
                token = context.HttpContext.Session.GetString(Constants.USER_TOKEN);

                /* if no token is found in session (web app), then recover it from authorization app using userId taken from cookies */
                if (string.IsNullOrEmpty(token))
                {
                    
                    JwtTokenModel? jwtToken = await authorizationHelper.getTokenForUserAsync(userId);
                    if (jwtToken != null)
                        token = jwtToken.Token;
                }

            }

            /* if token is empty, then manage unauthorized access */
            if (string.IsNullOrEmpty(token))
            {
                handleUnauthorizedAccess(context, logger, "No token found. Redirecting to login page.");
                return;
            }

            /* if a token is found, then check it */
            GenericMixedValuesResponseModel? result = await authorizationHelper.getLoginValidityAsync(token);
            if (result == null)
            {
                handleUnauthorizedAccess(context, logger, "Token is not valid. Redirecting to login page.");
                return;
            }

            if (!result.IsOk || string.IsNullOrEmpty(result.StringValue))
            {
                handleUnauthorizedAccess(context, logger, "Login is not valid. Redirecting to login page.");
                return;
            }

            context.HttpContext.Session.SetString(Constants.USER_TOKEN_EXPIRATION_DATETIME, result.StringValue);
            await next();
        }

        private void handleUnauthorizedAccess(ActionExecutingContext context, ILogger logger, string logMessage)
        {
            logger.LogWarning(logMessage);

            string loginUrl = GenericHelper.GetUrl(GenericHelper.GetControllerName(nameof(AccountController)), nameof(AccountController.Login));

            /* Check if this is an AJAX request */
            if (isAjaxRequest(context.HttpContext.Request))
            {
                /* Return 401 Unauthorized for AJAX requests - client-side handler will redirect */
                context.Result = new UnauthorizedResult();
            }
            else
            {
                /* Return redirect for regular page requests */
                context.Result = new RedirectResult(loginUrl);
            }
        }

        private bool isAjaxRequest(HttpRequest request)
        {
            return request.Headers["X-Requested-With"] == "XMLHttpRequest" ||
                   request.Headers.Accept.ToString().Contains("application/json");
        }
    }
}
