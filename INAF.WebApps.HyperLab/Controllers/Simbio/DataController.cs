using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.Simbio.Data;
using INAF.Libraries.Net.Extensions;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Features;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Footprints;
using INAF.Libraries.Net.Simbio.CommonModels.Models.GeoInfo;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Observations;
using INAF.Libraries.Net.Simbio.CommonModels.Models.Targets;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Resources;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers.Simbio
{
    //[Authorize]
    //[CheckIsLoginValid]
    public class DataController : BaseController
    {
        private readonly DbHandlerSimbio dbHandlerSimbio;

        public DataController(IServiceProvider serviceProvider,
                              ILogger<DataController> logger,
                              DbHandlerSimbio dbHandlerSimbio) : base(serviceProvider, logger)
        {
            this.dbHandlerSimbio = dbHandlerSimbio;
        }

        [HttpGet]
        public IActionResult Data()
        {
            return View("~/Views/Simbio/Data/Data.cshtml");
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

        #region OBSERVATIONS
        [HttpGet]
        public IActionResult GetObservationsForCharts(GenericRequestByValueModel model)
        {
            IEnumerable<ObservationOutputModel>? observations = dbHandlerSimbio.getObservationsForCharts(model.Value);
            if (observations.IsAny())
                return new JsonResult(new GenericResponseModel(observations!));
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }
        #endregion

        #region TARGETS
        [HttpGet]
        public IActionResult GetTargetInfo(GenericRequestByIdModel model)
        {
            TargetModel? targetInfo = dbHandlerSimbio.getTargetInfo(model.Id.ToString());
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

        #region STPs
        [HttpGet]
        public IActionResult GetStps()
        {
            IEnumerable<string>? stpValues = dbHandlerSimbio.getStps();
            return new JsonResult(stpValues);
        }
        #endregion
    }
}
