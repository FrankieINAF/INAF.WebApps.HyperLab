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
                              ILogger<BaseController> logger) : base(serviceProvider, logger)
        { }

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
    }
}
