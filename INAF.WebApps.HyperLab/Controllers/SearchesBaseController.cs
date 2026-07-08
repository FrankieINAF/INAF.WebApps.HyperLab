using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches.Interfaces;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using static INAF.Libraries.Net.HyperLab.CommonModels.Values.Enums;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SearchesBaseController : BaseController
    {
        protected readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SearchesBaseController(IServiceProvider serviceProvider,
                                      DbHandlerHyperLabData dbHandlerHyperLabData,
                                      ILogger<SpectraManagerController> logger) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        [HttpGet]
        public async Task<IActionResult> SearchGroupItems(GenericRequestByIdModel model)
        {
            List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(model.Id,
                                                                                                 await getUserIdAsync());
            if (spectrumInfoModels?.Count > 0)
                return new JsonResult(spectrumInfoModels);
            else
                return new JsonResult(null);
        }

        #region SUGGESTIONS
        [HttpGet]
        public async Task<IActionResult> GetSampleNameSuggestions(GenericRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text) || model.Text.Length < 3)
                return new EmptyResult();

            List<string>? sampleNames = dbHandlerHyperLabData.getSampleNameSuggestions(model.Text,
                                                                                       await getUserIdAsync());
            if (sampleNames?.Count > 0)
                return new JsonResult(sampleNames);
            else
                return new EmptyResult();
        }

        #endregion
        #region PROTECTED
        protected ContentResult buildJsonContentResult(object? inputValue)
        {
            string jsonResult = JsonSerializer.Serialize(inputValue);
            return Content(jsonResult, "application/json");
        }

        protected async Task<IEnumerable<ISpectraGroupInfoModel>?> retrieveSpectraFilesForGroupsAsync(IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo,
                                                                                                      List<int> levelIds)
        {
            foreach (var spectraGroupInfo in spectraFilesInfo ?? Enumerable.Empty<ISpectraGroupInfoModel>())
            {
                List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(spectraGroupInfo.Id,
                                                                                                     levelIds,
                                                                                                     await getUserIdAsync());
                if (spectrumInfoModels?.Count > 0)
                    spectraGroupInfo.Spectra = spectrumInfoModels;
            }

            logger.LogInformation($"{nameof(buildJsonContentResult)} - Retrieved {spectraFilesInfo?.Count()} spectra files for groups.");

            return spectraFilesInfo;
        }

        protected bool isRequestOkById(int id,
                                       List<int>? requestedLevels)
        {
            if (id < 1 ||
                requestedLevels == null ||
                !requestedLevels.Any())
                return false;

            return true;
        }

        protected bool isRequestOkByText(string? text,
                                         List<int>? requestedLevels)
        {
            if (string.IsNullOrEmpty(text) ||
                text.Length < 3 ||
                requestedLevels == null ||
                !requestedLevels.Any())
                return false;

            return true;
        }

        protected void setLastSearchSession(object json,
                                            SearchType searchType)
        {
            if (HttpContext.Session.ContainsKey(Values.Constants.LAST_SEARCH))
                HttpContext.Session.Remove(Values.Constants.LAST_SEARCH);

            HttpContext.Session.SetObject(Values.Constants.LAST_SEARCH, new SessionSearchModel() { SearchObjectJson = json, SearchType = searchType });
        }
        #endregion
    }
}
