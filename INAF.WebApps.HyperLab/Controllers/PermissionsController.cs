using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Values;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [IsLoginValid]
    public class PermissionsController : BaseController
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public PermissionsController(IServiceProvider serviceProvider,
                                     ILogger<PermissionsController> logger,
                                     DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        //[HttpGet]
        //public async Task<JsonResult> IsUpsertUserPermissionGranted()
        //{
        //    bool isAllowed = dbHandlerHyperLabUsers.isPermissionGranted((int)Enums.Permissions.UpsertUser,
        //                                                                await getUserIdAsync());

        //    return new JsonResult(isAllowed);
        //}

        //[HttpGet]
        //public async Task<JsonResult> IsSaveOnCloudFromAppPermissionGranted()
        //{
        //    bool isAllowed = dbHandlerHyperLabUsers.isPermissionGranted((int)Enums.Permissions.SaveOnCloudFromApp,
        //                                                                await getUserIdAsync());

        //    return new JsonResult(isAllowed);
        //}
    }
}
