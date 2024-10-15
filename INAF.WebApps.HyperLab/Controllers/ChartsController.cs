using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLabCommonModels.Models.Spectrum;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class ChartsController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerSLabData;

        public ChartsController(IServiceProvider serviceProvider, 
                                ILogger<ChartsController> logger,
                                DbHandlerHyperLabData dbHandlerSLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerSLabData = dbHandlerSLabData;
        }

        #region GET
        [HttpGet]
        public IActionResult GetSpectrumById(GenericRequestByIdModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerSLabData.getSpectrumById(model.Id,
                                                                              getUserId());
            if (spectrumModel == null)
                return new EmptyResult();

            return new JsonResult(spectrumModel);
        }

        [HttpGet]
        public IActionResult GetSpectrumByParentIdAndSpectrumType(GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerSLabData.getSpectrumByParentIdAndSpectrumType(model.ParentId,
                                                                                                   model.SpectrumType,
                                                                                                   getUserId());
            if (spectrumModel == null)
                return new EmptyResult();

            return new JsonResult(spectrumModel);
        }

        [HttpGet]
        public IActionResult GetWhiteSpectraForAlignment()
        {
            List<int>? ids = dbHandlerSLabData.getWhiteSpectraForAlignmentIds();

            if (ids == null || ids.Count == 0)
                return new JsonResult(null);

            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createRefWhitesJson(ids, 0)); // operationUserId = 0 for 'white' spectra available for everyone (not related to a specific insertUserId)
        }
        #endregion

        #region POST
        [HttpPost]
        public IActionResult GetSpectra([FromBody] GenericRequestByIdsModel model)
        {
            if (model.Ids == null || model.Ids.Count == 0)
                return new JsonResult(null);

            switch (getCallerContext())
            {
                case Libraries.Net.HyperLabCommonModels.Values.Enums.CallerContext.Web:
                    var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
                    return new JsonResult(chartsHelper.createMultipleSpectraJson(model.Ids, getUserId()));

                case Libraries.Net.HyperLabCommonModels.Values.Enums.CallerContext.App:
                    foreach (var id in model.Ids)
                    {
                        var spectrumModel = dbHandlerSLabData.getSpectrumById(id, getUserId());
                        if (spectrumModel != null)
                            return new JsonResult(spectrumModel);
                    }
                    break;
            }

            return new EmptyResult();
        }

        [HttpPost]
        public IActionResult GetProcessedSpectrum([FromBody] GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createSingleSpectrumJson(model.ParentId, model.SpectrumType, getUserId()));
        }
        #endregion
    }
}
