using INAF.Libraries.Net.CommonResources;
using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;
using static INAF.WebApps.HyperLab.Values.Enums;
using static Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary;

namespace INAF.WebApps.HyperLab.Controllers.Base
{
    public class BaseController : Controller
    {
        protected readonly IConfiguration? configuration;
        protected readonly IServiceProvider serviceProvider;
        protected readonly ILogger<BaseController> logger;

        public BaseController(IServiceProvider serviceProvider,
                              ILogger<BaseController> logger)
        {
            this.serviceProvider = serviceProvider;
            this.logger = logger;
        }

        public BaseController(IServiceProvider serviceProvider,
                              IConfiguration configuration,
                              ILogger<BaseController> logger) : this(serviceProvider, logger)
        {
            this.configuration = configuration;

            appPrefixForUserSecrets = configuration.GetSection("AppSettings:AppPrefixForUserSecrets").Value ?? string.Empty;
        }

        protected string? appPrefixForUserSecrets { get; set; }

        #region METHODS
        protected void clearErrorsForKey(string key)
        {
            try
            {
                ModelState[$"{key}"].Errors.Clear();
            }
            catch (Exception)
            { }
            try
            {
                ModelState[$"{key}"].ValidationState = ModelValidationState.Valid;
            }
            catch (Exception)
            { }
        }

        protected Caller getCaller()
        {
            string? token = HttpContext.GetToken();
            if (string.IsNullOrEmpty(token))
                return Caller.WebApp;
            else
                return Caller.App;
        }

        protected string decryptString(string text)
        {
            using (EncryptionHelper encryptionHelper = serviceProvider.GetRequiredService<EncryptionHelper>())
                return encryptionHelper.decryptString(text);
        }

        protected string getEncrypted(string text)
        {
            using (EncryptionHelper encryptionHelper = serviceProvider.GetRequiredService<EncryptionHelper>())
                return encryptionHelper.encryptString(text);
        }

        protected string getErrorMessage(ValueEnumerable values)
        {
            string exMsg = string.Empty;
            var errors = values.Where(x => x.Errors.Count > 0);
            foreach (var error in errors)
                exMsg += error.Errors.FirstOrDefault().ErrorMessage + ". ";

            return exMsg;
        }

        protected CallerContext getCallerContext()
        {
            string? token = HttpContext.GetToken();
            if (string.IsNullOrEmpty(token))
                return CallerContext.Web;
            else
                return CallerContext.App;
        }

        protected int getScientificResponsibleUserId()
        {
            var dbHandlerHyperLabUsers = serviceProvider.GetRequiredService<DbHandlerHyperLabUsers>();
            return dbHandlerHyperLabUsers.getScientificResponsibleUserId();
        }

        protected int getUserId()
        {
            string? token = HttpContext.GetToken();
            if (string.IsNullOrEmpty(token))
                return HttpContext.GetUserId();
            else
            {
                var dbHandlerHyperLabUsers = serviceProvider.GetRequiredService<DbHandlerHyperLabUsers>();
                return dbHandlerHyperLabUsers.getUserIdFromToken(token);
            }
        }

        protected (bool isUserAuthenticated, List<PermissionModel>? permissions) getUserStatus()
        {
            bool isUserAuthenticated = false;
            var cookieValue = HttpContext.Request.Cookies[Values.Constants.HYPERLAB_WEB_APP_COOKIES];
            if (!string.IsNullOrEmpty(cookieValue))
            {
                if (HttpContext.User.Identity != null)
                    isUserAuthenticated = HttpContext.User.Identity.IsAuthenticated;
            }

            var dbHandlerHyperLabUsers = serviceProvider.GetRequiredService<DbHandlerHyperLabUsers>();
            List<PermissionModel>? permissions = dbHandlerHyperLabUsers.getUserPermissions(getUserId(), Enums.CallerContext.Web);

            return (isUserAuthenticated, permissions);
        }

        protected bool isRemoteCheckInEditMode(string field1, string field2)
        {
            if (!string.IsNullOrEmpty(field1) && !string.IsNullOrEmpty(field2) && field1.Equals(field2))
                return true;
            else
                return false;
        }

        protected (bool isEditMode, string exMsg) isRemoteCheckInEditMode(string[] fields)
        {
            bool isEditMode = false;
            string exMsg = string.Empty;

            /* error when an empty array is passed */
            if (fields.Length == 0)
                return (false, Users.CheckIsUserExistantFieldsEmptyErrorMessage);

            /* error when an odd number of items in array passed */
            if (fields.Length % 2 > 0)
                return (false, Users.CheckIsUserExistantFieldsNumErrorMessage);

            bool[] results = new bool[fields.Length / 2];
            int counter = 0;
            for (int i = 0; i < fields.Length; i += 2)
            {
                results[counter] = fields[i].Equals(fields[i + 1]);
                counter++;
            }

            isEditMode = Array.TrueForAll(results, x => !x);

            return (isEditMode, exMsg);
        }

        protected void logErrorMessage(ValueEnumerable values)
        {
            string modelError = getErrorMessage(values);
            logger.LogError(modelError);
        }
        #endregion

        #region RESPONSE MODELS
        protected WebBaseModel getUpsertErrorStatusResponseModel()
        {
            return new WebBaseModel() { ControllerOperationStatus = ControllerOperationStatus.UpsertError };
        }

        protected WebBaseModel getOkStatusResponseModel()
        {
            return new WebBaseModel() { ControllerOperationStatus = ControllerOperationStatus.Ok };
        }
        #endregion
    }
}
