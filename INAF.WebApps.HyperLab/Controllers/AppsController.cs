using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Models;
using INAF.WebApps.HyperLab.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [AllowAnonymous]
    public class AppsController : BaseController
    {
        public AppsController(IServiceProvider serviceProvider,
                              IConfiguration configuration,
                              ILogger<BaseController> logger) : base(serviceProvider, configuration, logger)
        { }

        [HttpGet]
        public IActionResult GModeApp()
        {
            AppPageModel appPageModel = new AppPageModel(nameof(GModeApp),
                                                         Home.TileGModeAppTitle,
                                                         new List<string>
                                                         {
                                                             Apps.GModeAppDescription1, 
                                                             Apps.GModeAppDescription2
                                                         },
                                                         Apps.GModeAppAcknowledgments);
            return View("AppView", appPageModel);
        }

        [HttpGet]
        public IActionResult MLApp()
        {
            AppPageModel appPageModel = new AppPageModel(nameof(MLApp),
                                                         Home.TileMLAppTitle,
                                                         new List<string>
                                                         {
                                                             Apps.MLAppDescription1,
                                                             Apps.MLAppDescription2
                                                         });
            return View("AppView", appPageModel);
        }
    }
}
