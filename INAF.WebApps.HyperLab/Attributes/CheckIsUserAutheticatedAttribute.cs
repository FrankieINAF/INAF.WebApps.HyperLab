using Microsoft.AspNetCore.Mvc.Filters;

namespace INAF.WebApps.HyperLab.Attributes
{
    public class CheckIsUserAutheticatedAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? false)
            {
                context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedResult();
            }
        }
    }
}
