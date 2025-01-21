using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    //[Authorize]
    public class HomeController : BaseController
    {
        public HomeController(IServiceProvider serviceProvider, 
                              ILogger<HomeController> logger) : base(serviceProvider, logger)
        { }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View("Error");
        }
    }
}
