using INAF.Libraries.Net.CommonWebAppModels.Models.Info;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.CommonWebAppModels.Models.SpectraFiles;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData.Containers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Dynamic;
using INAF.Libraries.Net.HyperLab.CommonModels.Values;
using Newtonsoft.Json;
using LinqKit;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Shares;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public partial class SLabDataManagerController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SLabDataManagerController(IServiceProvider serviceProvider,
                                         ILogger<SLabDataManagerController> logger,
                                         DbHandlerHyperLabData dbHandlerHyperLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
        }

        [HttpGet]
        public IActionResult Chart([FromQuery] string ids)
        {
            IEnumerable<int>? Ids = null;
            if (!string.IsNullOrEmpty(ids))
            {
                Ids = ids.Split(',').Select(int.Parse);
                SelectedSpectraModel model = new SelectedSpectraModel() { Ids = Ids };
                return View(model);
            }

            return RedirectToAction("Error", "Home");
        }

        [HttpGet]
        public IActionResult Search()
        {
            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            SampleTypeValuesContainerExtended sampleTypeValuesContainerExtended = SampleTypeValuesContainerExtended.Create(sampleTypesHelper.getSampleTypeValuesContainer());
            return View(sampleTypeValuesContainerExtended);
        }

        [HttpGet]
        public async Task<IActionResult> SharedStuff()
        {
            List<SharedSpectrumModel>? spectraSharedWithMe = null;
            List<SharedSpectrumModel>? spectraSharedByMe = null;
            var tasks = new List<Task>
            {
                Task.Run(() => spectraSharedWithMe = dbHandlerHyperLabData.getSharedSpectraForUserAsync(getUserId())),
                Task.Run(() => spectraSharedByMe = dbHandlerHyperLabData.getSharedSpectraForOwnerUserAsync(getUserId()))
            };
            await Task.WhenAll(tasks);

            SharedStuffContainer sharedStuffContainer = new SharedStuffContainer(spectraSharedByMe, spectraSharedWithMe);

            return View(sharedStuffContainer);
        }

        private ContentResult buildJsonContentResult(object? inputValue)
        {
            string jsonResult = JsonConvert.SerializeObject(inputValue);
            return Content(jsonResult, "application/json");
        }

        private IEnumerable<ISpectraGroupInfoModel>? retrieveSpectraFilesForGroups(IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo)
        {
            spectraFilesInfo?.ForEach(spectraGroupInfo =>
            {
                List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(spectraGroupInfo.Id,
                                                                                                     getUserId());
                if (spectrumInfoModels?.Count > 0)
                    spectraGroupInfo.Spectra = spectrumInfoModels;
            });

            return spectraFilesInfo;
        }
    }
}
