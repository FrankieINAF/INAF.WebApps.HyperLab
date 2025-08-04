using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Values;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class HomeController : BaseController
    {
        public HomeController(IServiceProvider serviceProvider, 
                              ILogger<HomeController> logger) : base(serviceProvider, logger)
        { }

        public IActionResult Index()
        {
            HttpContext.Session.SetString(Constants.LAST_PAGE, nameof(Index));
            return View();
        }

        public IActionResult Error()
        {
            HttpContext.Session.SetString(Constants.LAST_PAGE, nameof(Error));
            return View("Error");
        }
    }
}
