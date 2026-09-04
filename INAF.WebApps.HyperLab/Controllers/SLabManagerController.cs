using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Models;
using INAF.WebApps.HyperLab.Resources;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SLabManagerController : BaseController
    {
        public SLabManagerController(IServiceProvider serviceProvider, 
                                     ILogger<BaseController> logger) : base(serviceProvider, logger)
        {
        }

        [HttpGet]
        public IActionResult HyperLabBulkInsertApp()
        {
            AppPageModel appPageModel = new AppPageModel(nameof(HyperLabBulkInsertApp),
                                                         Apps.BulkInsertAppTitle,
                                                         new List<string>
                                                         {
                                                             Apps.BulkInsertAppDescription1,
                                                             Apps.BulkInsertAppDescription2
                                                         });
            return View("BulkInsert", appPageModel);
        }
    }
}
