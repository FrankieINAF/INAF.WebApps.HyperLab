using INAF.Libraries.Net.SLabDbLibrary;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class AppActionsController : BaseController
    {
        public AppActionsController(IServiceProvider serviceProvider,
                                    IConfiguration configuration,
                                    DbHandler dbHandler,
                                    ILogger<BaseController> logger) : base(serviceProvider, configuration, dbHandler, logger)
        { }

        [HttpGet]
        public IActionResult CheckAlive()
        {
            return new JsonResult(true);
        }

        //public IActionResult Index()
        //{
        //    return View();
        //}

        //public IActionResult Privacy()
        //{
        //    return View();
        //}

        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //public IActionResult Error()
        //{
        //    return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        //}
    }
}