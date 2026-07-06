using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.DbValues;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using System.Dynamic;
using System.Security.Claims;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Extensions
{
    public static class Extensions
    {
        private static readonly string USER_ID = "UserId";

        public static void AddProperty(this ExpandoObject expando, string propertyName, object propertyValue)
        {
            // ExpandoObject supports IDictionary so we can extend it like this
            var expandoDict = expando as IDictionary<string, object>;
            if (expandoDict.ContainsKey(propertyName))
                expandoDict[propertyName] = propertyValue;
            else
                expandoDict.Add(propertyName, propertyValue);
        }

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
            catch (Exception)
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
                string authorization = httpContext.Request.Headers["Authorization"].ToString();
                if (string.IsNullOrWhiteSpace(authorization))
                    return null;

                const string bearerPrefix = "Bearer ";
                if (authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
                    return authorization[bearerPrefix.Length..].Trim();

                return authorization.Trim();
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static async Task<int> GetUserIdAsync(this HttpContext httpContext)
        {
            string? userToken = httpContext.GetToken();
            if (string.IsNullOrEmpty(userToken))
                // Web app caller
                return httpContext.GetUserId();
            else
            {
                /* try to retrieve the saved userId, if any */
                if (httpContext.Session.ContainsKey(USER_ID))
                    return int.Parse(httpContext.Session.GetString(USER_ID) ?? "0");
                else
                {
                    
                    // App caller
                    AuthorizationHelper authorizationHelper = httpContext.RequestServices.GetRequiredService<AuthorizationHelper>();
                    int userId = await authorizationHelper.getUserIdAsync(userToken);
                    if (userId > 0)
                        /* when a valid userId is retrieved, then it is saved to avoid calling multauthapp at each request */
                        httpContext.Session.SetString(USER_ID, userId.ToString());

                    return userId;
                }
            }
        }

        public static GrainSizeModel ToGrainSizeModel(this DbIntDoubleValue dbIntDoubleValue)
        {
            return new GrainSizeModel()
            {
                Id = dbIntDoubleValue.Id,
                Value = dbIntDoubleValue.DoubleValue,
            };
        }

        public static GrainSizeTypeModel ToGrainSizeTypeModel(this DbStringValue dbStringValue)
        {
            return new GrainSizeTypeModel()
            {
                Id = dbStringValue.Id,
                Type = dbStringValue.StringValue!,
                TypeValue = dbStringValue.StringValue!.ToGrainSizeType()
            };
        }

        public static OriginTypeModel ToOriginTypeModel(this DbStringValue dbStringValue)
        {
            return new OriginTypeModel()
            {
                Id = dbStringValue.Id,
                Value = dbStringValue.StringValue
            };
        }
    }
}
