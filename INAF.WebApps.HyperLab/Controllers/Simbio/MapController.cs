using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.Simbio.Data;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Features;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Footprints;
using INAF.Libraries.Net.Simbio.CommonModels.Models.GeoInfo;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Targets;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyModel;

namespace INAF.WebApps.HyperLab.Controllers.Simbio
{
    //[Authorize]
    //[CheckIsLoginValid]
    public class MapController : BaseController
    {
        private readonly DbHandlerSimbio dbHandlerSimbio;
        public MapController(IServiceProvider serviceProvider,
                                 ILogger<MapController> logger,
                                 DbHandlerSimbio dbHandlerSimbio) : base(serviceProvider, logger)
        {
            this.dbHandlerSimbio = dbHandlerSimbio;
        }

        [HttpGet]
        public IActionResult Map()
        {
            return View("~/Views/Simbio/Map/Map.cshtml");
        }

        #region FEATURES
        [HttpGet]
        public IActionResult GetFeatures(GenericRequestByTextModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Text))
                return new EmptyResult();

            IEnumerable<FeatureModel>? features = null;
            if (model.Text.Equals(SimbioMap.FeatureCategoryAll, StringComparison.OrdinalIgnoreCase))
                features = dbHandlerSimbio.getAllFeatures();
            else
                features = dbHandlerSimbio.getFeaturesByCategory(model.Text);

            return new JsonResult(features);
        }
        #endregion

        #region TARGETS
        [HttpGet]
        public IActionResult GetTargetInfo(GenericRequestByTextModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Text))
                return new EmptyResult();

            TargetModel? targetInfo = dbHandlerSimbio.getTargetInfo(model.Text);
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
        #endregion

        #region FOOTPRINTS
        [HttpGet]
        public IActionResult GetFootprintsByStp(GenericRequestByValueModel model)
        {
            IEnumerable<FootprintModel>? footprints = dbHandlerSimbio.getFootprintsByStp(model.Value);
            if (footprints.IsAny())
                return new JsonResult(footprints);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetStpsWithFootprints()
        {
            IEnumerable<string>? stpValues = dbHandlerSimbio.getStpsWithFootprints();
            return new JsonResult(stpValues);
        }
        #endregion
    }
}
