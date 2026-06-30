using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.Libraries.Net.CommonWebAppModels.Values;
using INAF.WebApps.HyperLab.Extensions;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class IsLoginValidHelper
    {
        public async Task<GenericValueStringResponseModel> isLoginValidAsync(HttpContext httpContext)
        {
            var authorizationHelper = httpContext.RequestServices.GetRequiredService<AuthorizationHelper>();
            var logger = httpContext.RequestServices.GetRequiredService<ILogger<IsLoginValidAttribute>>();

            int userId = await httpContext.GetUserIdAsync();

            if (userId <= 0)
                return GenericValueStringResponseModel.CreateErrorResponse("userId <= 0 - No token found. Redirecting to login page.");

            /* if the expiration-date has already been saved in session, use it */
            string expirationTokenString = httpContext.Session.GetString(Constants.USER_TOKEN_EXPIRATION_DATETIME) ?? string.Empty;
            if (!string.IsNullOrEmpty(expirationTokenString))
            {
                if (DateTime.TryParse(expirationTokenString, out DateTime expirationDateTime))
                {
                    if (DateTime.UtcNow < expirationDateTime)
                        return GenericValueStringResponseModel.CreateSuccessResponse("Token is still valid according to session expiration time.");
                    else
                        return GenericValueStringResponseModel.CreateErrorResponse("Login is not valid. Redirecting to login page.");
                }
            }

            /* if expiration-date has not yet been saved... */
            /* 1) retrieve token from 'Authorization' header (App) */
            string? token = httpContext.GetToken();
            if (string.IsNullOrEmpty(token))
            {
                /* if no token is found in 'Authorization' header (App), then recover it from session (web app):
                 * it has been saved on login */
                token = httpContext.Session.GetString(Constants.USER_TOKEN);

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
                return GenericValueStringResponseModel.CreateErrorResponse("No token found. Redirecting to login page.");

            /* if a token is found, then check it */
            GenericMixedValuesResponseModel? result = await authorizationHelper.getLoginValidityAsync(token);
            if (result == null)
                return GenericValueStringResponseModel.CreateErrorResponse("Token is not valid. Redirecting to login page.");

            if (!result.IsOk)
                return GenericValueStringResponseModel.CreateErrorResponse("Token is not valid. Redirecting to login page.");

            if (string.IsNullOrEmpty(result.StringValue))
            {
                return GenericValueStringResponseModel.CreateErrorResponse(result.StringValue);
            }

            httpContext.Session.SetString(Constants.USER_TOKEN_EXPIRATION_DATETIME, result.StringValue);
            return GenericValueStringResponseModel.CreateSuccessResponse("Token is valid. Expiration date saved in session.");
        }
    }
}
