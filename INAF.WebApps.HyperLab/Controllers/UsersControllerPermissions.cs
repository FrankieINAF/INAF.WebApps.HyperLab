using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class UsersController
    {
        [HttpGet]
        public IActionResult IsUserStrictlyAuthorizedForSpectrum(GenericRequestByIdModel model)
        {
            var dbHandlerHyperLabData = serviceProvider.GetRequiredService<DbHandlerHyperLabData>();
            return new JsonResult(new GenericResponseModel() { IsOk = dbHandlerHyperLabData.isUserStrictlyAuthorized(model.Id, getUserId()) });
        }

        [HttpPost]
        public JsonResult GetPermissionsForRole([FromBody] GenericRequestByIdModel model)
        {
            return new JsonResult(dbHandlerHyperLabUsers.getRolePermissions(model.Id, getCallerContext()));
        }
    }
}
