using INAF.Libraries.Net.DB.HyperLabData;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SpectraPublicActionsController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SpectraPublicActionsController(IServiceProvider serviceProvider,
                                              DbHandlerHyperLabData dbHandlerHyperLabData,
                                              ILogger<BaseController> logger) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        [HttpGet]
        public IActionResult GetSpectraTypesParents()
        {
            var keyValuePairs = dbHandlerHyperLabData.getSpectraTypesParents();
            return new JsonResult(keyValuePairs);
        }
    }
}
