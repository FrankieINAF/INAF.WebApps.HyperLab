using INAF.Libraries.Net.DB.Simbio.Data;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.Simbio.CommonModels.Models.GeoInfo;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers.Simbio
{
    public class TargetsController : BaseController
    {
        private readonly DbHandlerSimbio dbHandlerSimbio;
        public TargetsController(IServiceProvider serviceProvider,
                                 ILogger<TargetsController> logger,
                                 DbHandlerSimbio dbHandlerSimbio) : base(serviceProvider, logger)
        {
            this.dbHandlerSimbio = dbHandlerSimbio;
        }

        public IActionResult Viewer()
        { 
            return View("~/Views/Simbio/Targets/Viewer.cshtml"); 
        }

        public IActionResult GetTargetsWithObsCoords()
        {
            IEnumerable<TargetInfoModel>? targetInfos = dbHandlerSimbio.getTargetsWithObsCoords();
            if (targetInfos.IsAny())
                return new JsonResult(targetInfos);
            else
                return new EmptyResult();
        }
    }
}
