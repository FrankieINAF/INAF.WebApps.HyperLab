using INAF.Libraries.Net.CommonWebAppModels.Models.Info;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class SampleAndMeasurementController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SampleAndMeasurementController(IServiceProvider serviceProvider,
                                              ILogger<SampleAndMeasurementController> logger,
                                              DbHandlerHyperLabData dbHandlerHyperLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        #region PARTIAL VIEWS
        [HttpGet]
        public IActionResult LoadSpectrumMeasurementInfoView(GenericRequestByIdModel model)
        {
            var generalInfo = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                    getUserId());
            if (generalInfo == null)
                return new EmptyResult();

            int spectrumId = model.Id;
            if (generalInfo.Type != Enums.SpectrumType.Raw)
                spectrumId = dbHandlerHyperLabData.getParentRawSpectrumId(model.Id, getUserId());

            var measurementInfo = dbHandlerHyperLabData.getSpectrumFileMeasurementInfo(spectrumId,
                                                                           getUserId());

            if (measurementInfo != null)
                return PartialView("Partials/_InfoMeasurementInfo", measurementInfo);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult LoadSpectrumSampleDataPanelView(GenericRequestByIdModel model)
        {
            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            var sampleDataAvailableValues = sampleTypesHelper.getSampleTypeValuesContainer();

            var generalInfo = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                        getUserId());
            if (generalInfo == null)
                return new EmptyResult();

            int spectrumId = model.Id;
            if (generalInfo.Type != Enums.SpectrumType.Raw)
                spectrumId = dbHandlerHyperLabData.getParentRawSpectrumId(model.Id, getUserId());

            var sampleDataSelectedValues = dbHandlerHyperLabData.getSpectrumFileSampleData(spectrumId,
                                                                               getUserId());

            if (sampleDataSelectedValues != null && sampleDataAvailableValues != null)
                return PartialView("Partials/_InfoSampleData", new SpectrumFileSampleDataValuesContainer(model.Id, sampleDataAvailableValues, sampleDataSelectedValues));
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult LoadSpectrumSampleSelectedValuesView(ChangeMineralTypeIdRequestModel model)
        {
            var sampleDataSelectedValues = dbHandlerHyperLabData.getSpectrumFileSampleData(model.Id,
                                                                               getUserId());

            if (sampleDataSelectedValues != null)
            {
                if (model.SelectedMineralTypeId != sampleDataSelectedValues.MineralTypeId)
                    /* if the 2 values are different, then we want to change the mineral type selection, otherwise we're reloading original value */
                    sampleDataSelectedValues.MineralTypeId = model.SelectedMineralTypeId;
                return PartialView("Partials/_SelectedMineralType", sampleDataSelectedValues);
            }
            else
                return new EmptyResult();
        }
        #endregion

        #region GET
        [HttpGet]
        public IActionResult GetSampleDataValues()
        {
            return new JsonResult(dbHandlerHyperLabData.getSampleTypeValuesWithGrainSizeValues());
        }

        [HttpGet]
        public IActionResult GetSpectrumMeasurementInfo(int FileId)
        {
            var spectrumMeasurementInfo = dbHandlerHyperLabData.getSpectrumFileMeasurementInfo(FileId,
                                                                                   getUserId());
            if (spectrumMeasurementInfo != null)
                return new JsonResult(spectrumMeasurementInfo);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetSpectrumSampleData(GenericRequestByIdModel model)
        {
            var spectrumSampleData = dbHandlerHyperLabData.getSpectrumFileSampleData(model.Id,
                                                                         getUserId());
            if (spectrumSampleData != null)
                return new JsonResult(spectrumSampleData);
            else
                return new EmptyResult();
        }
        #endregion

        [HttpPost]
        public async Task<IActionResult> DeleteMineral([FromBody] DeleteMaterialRequestModel model)
        {
            if (await dbHandlerHyperLabData.deleteMineralLinkAsync(model.SpectrumId,
                                                              model.MaterialId,
                                                              getUserId()))
                return new JsonResult(GenericResponseModel.CreateSuccessResponse());
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpPost]
        public async Task<IActionResult> SaveInfo([FromBody] InfoSelectedValuesModel model)
        {
            clearErrorsForKey($"{nameof(InfoSelectedValuesModel.SampleDataSelectedValues)}.{nameof(SampleDataSelectedValues.Name)}");

            if (ModelState.IsValid)
            {
                if (model.SampleDataSelectedValues!.Minerals.Count > 0)
                {
                    model.SampleDataSelectedValues.Minerals.All(x => { x.Name = x.Name!.ReplaceLineEndings(string.Empty).Trim(); return true; });
                }

                /* save file */
                (bool isOk, int id) result = await dbHandlerHyperLabData.saveSpectrumInfoProcedureAsync(model,
                                                                                                        getUserId(),
                                                                                                        getScientificResponsibleUserId());
                return new JsonResult(result.ToGenericValueStringResponse());
            }
            else
            {
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());
            }
        }
    }
}
