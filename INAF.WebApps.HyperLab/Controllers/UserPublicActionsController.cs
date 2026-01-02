using INAF.Libraries.Net.CommonWebAppModels.Models.Menu;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class UserPublicActionsController : BaseController
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public UserPublicActionsController(IServiceProvider serviceProvider,
                                           DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                           ILogger<BaseController> logger) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpGet]
        public async Task<IActionResult> GetMenu(SearchRequestByNullableIdModel model)
        {
            int userId = await getUserIdAsync();
            List<MenuItem>? menuItems = dbHandlerHyperLabUsers.getMenuItemsForApp(userId, model.Id);
            if (menuItems?.Count > 0)
                return new JsonResult(menuItems);
            else
                return new EmptyResult();
        }
    }
}
