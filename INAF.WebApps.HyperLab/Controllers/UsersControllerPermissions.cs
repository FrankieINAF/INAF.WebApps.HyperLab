using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class UsersController
    {
        [HttpPost]
        public JsonResult GetPermissionsForRole([FromBody] GenericRequestByIdModel model)
        {
            return new JsonResult(dbHandlerHyperLabUsers.getRolePermissions(model.Id, getCallerContext()));
        }
    }
}
