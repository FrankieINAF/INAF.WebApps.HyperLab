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

        public IActionResult GetTargetsObsCoords()
        {
            IEnumerable<TargetObsCoordsModel>? targetObsCoords = dbHandlerSimbio.getTargetsObsCoords();
            if (targetObsCoords.IsAny())
                return new JsonResult(targetObsCoords);
            else
                return new EmptyResult();
        }
    }
}
