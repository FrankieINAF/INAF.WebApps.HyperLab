using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SLabManagerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
