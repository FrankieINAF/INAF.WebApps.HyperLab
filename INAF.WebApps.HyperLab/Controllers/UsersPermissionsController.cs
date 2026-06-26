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
        public IActionResult IsUserAuthenticated(GenericRequestByIdModel model)
        {
            string? isAuthenticated = HttpContext.Session.GetString(IS_USER_AUTHENTICATED);
            return new JsonResult(new GenericResponseModel() { IsOk = bool.TryParse(isAuthenticated, out bool result) && result });
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
