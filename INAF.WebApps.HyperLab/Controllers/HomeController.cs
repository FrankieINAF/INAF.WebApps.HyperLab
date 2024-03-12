using INAF.Libraries.Net.SLabDbLibrary;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    public class HomeController : BaseController
    {
        public HomeController(IServiceProvider serviceProvider, 
                              IConfiguration configuration, 
                              DbHandler dbHandler, 
                              ILogger<BaseController> logger) : base(serviceProvider, configuration, dbHandler, logger)
        { }

        public IActionResult Index()
        {
            return View();
        }
    }
}
