using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Extensions;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Info;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.MeasurementInfo;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static INAF.Libraries.Net.ScienceModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [IsLoginValid]
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
        public async Task<IActionResult> LoadSpectrumMeasurementInfoView(GenericRequestByIdModel model)
        {
            var generalInfo = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                           isPublicSearch(),
                                                                           await getUserIdAsync());
            if (generalInfo == null)
                return new EmptyResult();

            int spectrumId = model.Id;
            if (generalInfo.Type != SpectrumType.Raw)
                spectrumId = dbHandlerHyperLabData.getParentRawSpectrumId(model.Id, isPublicSearch(), await getUserIdAsync());

            var measurementInfo = dbHandlerHyperLabData.getSpectrumFileMeasurementInfo(spectrumId,
                                                                                       isPublicSearch(),
                                                                                       await getUserIdAsync());

            /* create empty model for spectra with no measurement info */
            if (measurementInfo == null)
                measurementInfo = new SpectrumFileMeasurementInfoValues();

            if (dbHandlerHyperLabData.isUserStrictlyAuthorized(model.Id, await getUserIdAsync()))
                return PartialView("Partials/_InfoMeasurementInfoEditor", measurementInfo);
            else
                return PartialView("Partials/_InfoMeasurementInfoViewer", measurementInfo);
        }

        [HttpGet]
        public async Task<IActionResult> LoadSpectrumSampleDataView(GenericRequestByIdModel model)
        {
            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            var sampleDataAvailableValues = sampleTypesHelper.getSampleTypeValuesContainer();

            var generalInfo = dbHandlerHyperLabData.getSpectrumMinimalInfo(model.Id,
                                                                           isPublicSearch(),
                                                                           await getUserIdAsync());
            if (generalInfo == null)
                return new EmptyResult();

            int spectrumId = model.Id;
            if (generalInfo.Type != SpectrumType.Raw)
                spectrumId = dbHandlerHyperLabData.getParentRawSpectrumId(model.Id, isPublicSearch(), await getUserIdAsync());

            var sampleDataSelectedValues = dbHandlerHyperLabData.getSpectrumFileSampleData(spectrumId, isPublicSearch(), await getUserIdAsync());

            /* create empty model for spectra with no sample data */
            if (sampleDataSelectedValues == null)
                sampleDataSelectedValues = SampleDataSelectedValues.CreateEmpty();

            if (dbHandlerHyperLabData.isUserStrictlyAuthorized(model.Id, await getUserIdAsync()))
                return PartialView("Partials/_InfoSampleDataEditor", new SpectrumFileSampleDataValuesContainer(model.Id, sampleDataAvailableValues, sampleDataSelectedValues, isEditAllowed: true));
            else
                return PartialView("Partials/_InfoSampleDataViewer", new SpectrumFileSampleDataValuesContainer(model.Id, sampleDataAvailableValues, sampleDataSelectedValues, isEditAllowed: false));
        }

        [HttpGet]
        public async Task<IActionResult> LoadSpectrumSampleSelectedValuesView(ChangeMineralTypeIdRequestModel model)
        {
            var sampleDataSelectedValues = dbHandlerHyperLabData.getSpectrumFileSampleData(model.Id,
                                                                                           isPublicSearch(),
                                                                                           await getUserIdAsync());

            /* create empty model for spectra with no sample data */
            if (sampleDataSelectedValues == null)
                sampleDataSelectedValues = new SampleDataSelectedValues();

            /* if the 2 values are different, then we want to change the mineral type selection, otherwise we're reloading original value */
            sampleDataSelectedValues.MineralTypeId = model.SelectedMineralTypeId;

            return PartialView("Partials/_SelectedMineralTypeEditor", sampleDataSelectedValues);
        }
        #endregion

        #region GET
        [HttpGet]
        public IActionResult GetSampleDataValuesWithGrainsizeValues()
        {
            return new JsonResult(dbHandlerHyperLabData.getSampleTypeValuesWithGrainSizeValues());
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumMeasurementInfo(int FileId)
        {
            var spectrumMeasurementInfo = dbHandlerHyperLabData.getSpectrumFileMeasurementInfo(FileId,
                                                                                               isPublicSearch(),
                                                                                               await getUserIdAsync());
            if (spectrumMeasurementInfo != null)
                return new JsonResult(spectrumMeasurementInfo);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetSpectrumSampleData(GenericRequestByIdModel model)
        {
            var spectrumSampleData = dbHandlerHyperLabData.getSpectrumFileSampleData(model.Id,
                                                                                     isPublicSearch(),
                                                                                     await getUserIdAsync());
            if (spectrumSampleData != null)
                return new JsonResult(spectrumSampleData);
            else
                return new EmptyResult();
        }
        #endregion

        #region POST
        [HttpPost]
        public async Task<IActionResult> DeleteMineral([FromBody] DeleteMaterialRequestModel model)
        {
            if (await dbHandlerHyperLabData.deleteMineralLinkAsync(model.SpectrumId,
                                                                   model.MaterialId,
                                                                   await getUserIdAsync()))
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
                                                                                                        isPublicSearch(),
                                                                                                        await getUserIdAsync(),
                                                                                                        getScientificResponsibleUserId());
                return new JsonResult(result.ToGenericValueStringResponse());
            }
            else
            {
                logErrorMessage(ModelState.Values);
                return new JsonResult(GenericValueStringResponseModel.CreateErrorResponse());
            }
        }
        #endregion
    }
}
