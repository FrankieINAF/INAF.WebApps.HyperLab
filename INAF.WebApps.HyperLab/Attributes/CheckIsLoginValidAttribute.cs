using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Controllers;
using INAF.WebApps.HyperLab.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace INAF.WebApps.HyperLab.Attributes
{
    public class CheckIsLoginValidAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            int userId = int.MinValue;

            var dbHandler = filterContext.HttpContext.RequestServices.GetRequiredService<DbHandlerHyperLabUsers>();

            /* retrieve userId from token or from context */
            string token = filterContext.HttpContext.GetToken();
            if (string.IsNullOrEmpty(token))
                userId = filterContext.HttpContext.GetUserId();
            else
                userId = dbHandler.getUserIdFromToken(token.Replace("Bearer ", string.Empty));

            /* redirect to action depending on login */
            if (!dbHandler.isLoginValid(userId))
            {
                filterContext.Result = new RedirectResult(GenericHelper.GetUrl(GenericHelper.GetControllerName(nameof(AccountController)), nameof(AccountController.Login)));
            }
        }
    }
}
