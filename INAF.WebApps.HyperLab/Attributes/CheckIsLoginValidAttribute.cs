using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.CommonWebAppModels.Values;
using INAF.WebApps.HyperLab.Controllers;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace INAF.WebApps.HyperLab.Attributes
{
    public class CheckIsLoginValidAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var isLoginValidHelper = context.HttpContext.RequestServices.GetRequiredService<IsLoginValidHelper>();
            if (isLoginValidHelper == null)
                throw new InvalidOperationException("IsLoginValidHelper service is not registered.");

            var response = await isLoginValidHelper.isLoginValidAsync(context.HttpContext);
            if (response == null)
                throw new InvalidOperationException("IsLoginValidHelper returned null response.");

            if (response.IsOk)
            {
                await next();
                return;
            }
            else
            {
                handleUnauthorizedAccess(context, context.HttpContext.RequestServices.GetRequiredService<ILogger<CheckIsLoginValidAttribute>>(), response.Value ?? "Login is not valid. Redirecting to login page.");
                return;
            }
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
