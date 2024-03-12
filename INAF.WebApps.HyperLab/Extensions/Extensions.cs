using System.Dynamic;

namespace INAF.WebApps.HyperLab.Extensions
{
    public static class Extensions
    {
        public static string GetToken(this HttpContext httpContext)
        {
            try
            {
                if (!string.IsNullOrEmpty(httpContext.Request.Headers["Authorization"]))
                    return httpContext.Request.Headers["Authorization"].FirstOrDefault().Replace("Bearer ", string.Empty);
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
