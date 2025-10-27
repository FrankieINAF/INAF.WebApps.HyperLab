using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.Simbio.Data;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.Simbio.CommonModels.Models.GeoInfo;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Targets;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers.Simbio
{
    //[Authorize]
    //[CheckIsLoginValid]
    public class TargetsController : BaseController
    {
        private readonly DbHandlerSimbio dbHandlerSimbio;
        public TargetsController(IServiceProvider serviceProvider,
                                 ILogger<TargetsController> logger,
                                 DbHandlerSimbio dbHandlerSimbio) : base(serviceProvider, logger)
        {
            this.dbHandlerSimbio = dbHandlerSimbio;
        }

        [HttpGet]
        public IActionResult Map()
        { 
            return View("~/Views/Simbio/Targets/Map.cshtml"); 
        }

        [HttpGet]
        public IActionResult GetTargetInfo(GenericRequestByIdModel model)
        {
            TargetModel? targetInfo = dbHandlerSimbio.getTargetInfo(model.Id);
            if (targetInfo != null)
                return new JsonResult(targetInfo);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetTargetsWithObsCoords()
        {
            IEnumerable<TargetGeoInfoModel>? targetInfos = dbHandlerSimbio.getTargetsWithObsCoords();
            if (targetInfos.IsAny())
                return new JsonResult(targetInfos);
            else
                return new EmptyResult();
        }
    }
}
