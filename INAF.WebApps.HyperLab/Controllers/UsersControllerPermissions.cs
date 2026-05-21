using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class UsersController
    {
        [HttpGet]
        public async Task<IActionResult> IsUserAuthenticated(GenericRequestByIdModel model)
        {
            var status = await getUserStatusAsync();
            return new JsonResult(new GenericResponseModel() { IsOk = status.isUserAuthenticated });
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
