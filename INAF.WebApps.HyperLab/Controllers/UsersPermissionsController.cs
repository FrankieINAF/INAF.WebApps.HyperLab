using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class UsersPermissionsController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public UsersPermissionsController(IServiceProvider serviceProvider,
                                          DbHandlerHyperLabData dbHandlerHyperLabData,
                                          DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                          ILogger<BaseController> logger) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> IsAuthorized(GenericRequestByIdModel model)
        {
            return new JsonResult(new GenericResponseModel() { IsOk = HttpContext.User.Identity?.IsAuthenticated ?? false });
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> IsPublicOrAuthorized(GenericRequestByIdModel model)
        {
            return new JsonResult(new GenericResponseModel() { IsOk = await isPublicOrAuthorizedSearchAsync() });
        }

        [HttpGet]
        public async Task<IActionResult> IsUserStrictlyAuthorizedForSpectrum(GenericRequestByIdModel model)
        {
            return new JsonResult(new GenericResponseModel() { IsOk = dbHandlerHyperLabData.isUserStrictlyAuthorized(model.Id, await getUserIdAsync()) });
        }

        [HttpPost]
        public JsonResult GetPermissionsForRole([FromBody] GenericRequestByIdModel model)
        {
            return new JsonResult(dbHandlerHyperLabUsers.getRolePermissions(model.Id, getCallerContext()));
        }
    }
}
