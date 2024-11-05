using System.Dynamic;
using System.Security.Claims;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Extensions
{
    public static class Extensions
    {
        public static CallerContext GetPermissionContext(this HttpContext httpContext)
        {
            string? token = httpContext.GetToken();
            if (string.IsNullOrEmpty(token))
                return CallerContext.Web;
            else
                return CallerContext.App;
        }

        public static int GetUserId(this HttpContext httpContext)
        {
            int userId = 0;

            try
            {
                int.TryParse(httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
            }
            catch (Exception ex)
            { }

            return userId;
        }

        public static string? GetUserName(this HttpContext httpContext)
        {
            return httpContext.User.FindFirstValue(ClaimTypes.Name);
        }

        public static string? GetToken(this HttpContext httpContext)
        {
            try
            {
                if (!string.IsNullOrEmpty(httpContext.Request.Headers["Authorization"]))
                    return httpContext.Request.Headers.Authorization.First().Replace("Bearer ", string.Empty);
                else
                    return null;
            }
            catch (Exception)
            {
                return null;
            }
        }



        public static void AddProperty(this ExpandoObject expando, string propertyName, object propertyValue)
        {
            // ExpandoObject supports IDictionary so we can extend it like this
            var expandoDict = expando as IDictionary<string, object>;
            if (expandoDict.ContainsKey(propertyName))
                expandoDict[propertyName] = propertyValue;
            else
                expandoDict.Add(propertyName, propertyValue);
        }
    }
}
