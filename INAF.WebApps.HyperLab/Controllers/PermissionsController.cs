using INAF.Libraries.Net.SLabDbLibrary;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Values;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class PermissionsController : BaseController
    {
        public PermissionsController(IServiceProvider serviceProvider, 
                                     DbHandler dbHandler, 
                                     ILogger<BaseController> logger) : base(serviceProvider, dbHandler, logger)
        { }

        [HttpGet]
        public JsonResult IsUpsertUserPermissionGranted()
        {
            bool isAllowed = dbHandler.isPermissionGranted((int)Enums.Permissions.UpsertUser,
                                                           getUserId());

            return new JsonResult(isAllowed);
        }

        [HttpGet]
        public JsonResult IsSaveOnCloudFromAppPermissionGranted()
        {
            bool isAllowed = dbHandler.isPermissionGranted((int)Enums.Permissions.SaveOnCloudFromApp,
                                                           getUserId());

            return new JsonResult(isAllowed);
        }
    }
}
