using INAF.Libraries.Net.CommonWebAppModels.Models.Menu;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class PublicController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public PublicController(IServiceProvider serviceProvider,
                                DbHandlerHyperLabData dbHandlerHyperLabData,
                                DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                                ILogger<BaseController> logger) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        [HttpGet]
        public IActionResult PublicStuff()
        {
            return View();
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

        #region PUBLIC STUFF
        [HttpGet]
        public IActionResult GetPublicFilenameGroups()
        {
            var filenames = dbHandlerHyperLabData.getPublicFilenameGroups();
            if (filenames?.Count > 0)
                return new JsonResult(filenames);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetPublicMineralTypeGroups()
        {
            var mineralTypes = dbHandlerHyperLabData.getPublicMineralTypeGroups();
            if (mineralTypes?.Count > 0)
                return new JsonResult(mineralTypes);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetPublicOriginTypeGroups()
        {
            var originTypes = dbHandlerHyperLabData.getPublicOriginTypeGroups();
            if (originTypes?.Count > 0)
                return new JsonResult(originTypes);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetPublicSampleNameGroups()
        {
            var sampleNames = dbHandlerHyperLabData.getPublicSampleNameGroups();
            if (sampleNames?.Count > 0)
                return new JsonResult(sampleNames);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetPublicSampleTypeGroups()
        {
            var sampleTypes = dbHandlerHyperLabData.getPublicSampleTypeGroups();
            if (sampleTypes?.Count > 0)
                return new JsonResult(sampleTypes);
            else
                return new EmptyResult();
        }
        #endregion
    }
}
