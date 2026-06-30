using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Mvc;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SearchesSimpleController : SearchesBaseController
    {
        private readonly IsLoginValidHelper isLoginValidHelper;

        public SearchesSimpleController(IServiceProvider serviceProvider,
                                        ILogger<SpectraManagerController> logger,
                                        DbHandlerHyperLabData dbHandlerHyperLabData) : base(serviceProvider, dbHandlerHyperLabData, logger)
        { }

        [HttpPost]
        public async Task<IActionResult> SearchSimpleGroupsByFilename([FromBody] SearchRequestByTextModel model,
                                                                       bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkByText(model.Text, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByFilename(model.Text!,
                                                                                                                      model.RequestedLevels!,
                                                                                                                      await isPublicOrAuthorizedSearchAsync(),
                                                                                                                      await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByFilename);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public async Task<IActionResult> SearchSimpleGroupsByMaterial([FromBody] SearchRequestByParametersModel model,
                                                                       bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = searchByMaterialHelper.searchByMaterial(model.Id,
                                                                                                           model.Type!,
                                                                                                           model.RequestedLevels!,
                                                                                                           await isPublicOrAuthorizedSearchAsync(),
                                                                                                           await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByMaterial);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public async Task<IActionResult> SearchSimpleGroupsByMineralType([FromBody] SearchRequestByIdModel model,
                                                                         bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByMineralType(model.Id,
                                                                                                                         model.RequestedLevels!,
                                                                                                                         await isPublicOrAuthorizedSearchAsync(),
                                                                                                                         await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByMineralType);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public async Task<IActionResult> SearchSimpleGroupsByOriginType([FromBody] SearchRequestByIdModel model,
                                                                         bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByOriginType(model.Id,
                                                                                                                        model.RequestedLevels!,
                                                                                                                        await isPublicOrAuthorizedSearchAsync(),
                                                                                                                        await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleByOriginType);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public async Task<IActionResult> SearchSimpleGroupsBySampleName([FromBody] SearchRequestByTextModel model,
                                                                        bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkByText(model.Text, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleName(model.Text!,
                                                                                                                        model.RequestedLevels!,
                                                                                                                        await isPublicOrAuthorizedSearchAsync(),
                                                                                                                        await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleBySampleName);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }

        [HttpPost]
        public async Task<IActionResult> SearchSimpleGroupsBySampleType([FromBody] SearchRequestByIdModel model,
                                                                         bool saveSessionVariable = true)
        {
            if (model == null || !isRequestOkById(model.Id, model.RequestedLevels))
                return new EmptyResult();

            IEnumerable<SpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleType(model.Id,
                                                                                                                        model.RequestedLevels!,
                                                                                                                        await isPublicOrAuthorizedSearchAsync(),
                                                                                                                        await getUserIdAsync());

            if (saveSessionVariable)
                setLastSearchSession(model, Enums.SearchType.SimpleBySampleType);

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("~/Views/Searches/Partials/_SearchResults.cshtml", new SearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo, model.RequestedLevels!));
            }

            return new EmptyResult();
        }
    }
}
