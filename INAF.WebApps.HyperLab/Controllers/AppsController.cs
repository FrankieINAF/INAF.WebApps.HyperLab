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
        public IActionResult Download([FromQuery] string appName, [FromQuery] string osName)
        {
            string downloadRoot = configuration!.GetSection("AppSettings:DownloadRootPath").Value ?? string.Empty;
            if (string.IsNullOrEmpty(downloadRoot) || !Directory.Exists(downloadRoot))
                return NotFound();

            string downloadPath = Path.Combine(downloadRoot, appName);

            string downloadAppName = $"{appName}_{osName}.zip";
            return PhysicalFile(Path.Combine(downloadPath, downloadAppName), "application/octet-stream", downloadAppName);
        }

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
    }
}
