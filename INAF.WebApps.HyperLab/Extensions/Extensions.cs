using INAF.Libraries.Net.DB.HyperLabData.Models.DbValues;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using System.Dynamic;
using System.Security.Claims;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Extensions
{
    public static class Extensions
    {
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
                {
                    if (httpContext.Request.Headers["Authorization"].Count > 0)
                        return httpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", string.Empty);
                    else
                        return null;
                    //return httpContext.Request.Headers.Authorization.First().Replace("Bearer ", string.Empty);
                }
                else
                    return null;
            }
            catch (Exception)
            {
                return null;
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
