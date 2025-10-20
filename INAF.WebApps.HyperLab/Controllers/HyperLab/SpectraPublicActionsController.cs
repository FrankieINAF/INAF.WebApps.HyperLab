using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers.HyperLab
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
        public IActionResult GetChildrenSpectraTypes(int SpectrumTypeId)
        {
            var dbHandlerHyperLabData = serviceProvider.GetRequiredService<DbHandlerHyperLabData>();
            List<SpectrumType> childrenSpectraTypes = dbHandlerHyperLabData.getChildrenSpectraTypes(SpectrumTypeId.ToSpectrumType());
            if (childrenSpectraTypes.Any())
            {
                childrenSpectraTypes.Add(SpectrumTypeId.ToSpectrumType());
                return new JsonResult(childrenSpectraTypes);
            }
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetRefSpectrumByType(SpectrumRequestByTypeModel model)
        {
            ISpectrumModel? spectrumModel = dbHandlerHyperLabData.getCommonRefSpectrumByType(model.SpectrumType);

            if (spectrumModel != null)
                return new JsonResult(spectrumModel);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectraTypesParents()
        {
            var keyValuePairs = dbHandlerHyperLabData.getSpectraTypesParents();
            return new JsonResult(keyValuePairs);
        }

        [HttpGet]
        public IActionResult IsWhiteSpectrum(GenericRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text))
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            var isWhiteResponse = dbHandlerHyperLabData.isWhiteSpectrum(model.Text);
            return new JsonResult(isWhiteResponse);
        }
    }
}
