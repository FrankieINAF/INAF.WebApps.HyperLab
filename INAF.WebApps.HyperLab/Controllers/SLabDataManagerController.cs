using INAF.Libraries.Net.CommonWebAppModels.Models.Info;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Shares;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using LinqKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public partial class SLabDataManagerController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public SLabDataManagerController(IServiceProvider serviceProvider,
                                         ILogger<SLabDataManagerController> logger,
                                         DbHandlerHyperLabData dbHandlerHyperLabData,
                                         DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
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
            IEnumerable<SharedSpectrumModel>? spectraSharedWithMe = null;
            IEnumerable<SharedSpectrumModel>? spectraSharedByMe = null;
            var tasks = new List<Task>
            {
                Task.Run(() => spectraSharedWithMe = getSharedSpectra(getUserId(), dbHandlerHyperLabData.getSharedSpectraForSubjectUser)),
                Task.Run(() => spectraSharedByMe = getSharedSpectra(getUserId(), dbHandlerHyperLabData.getSharedSpectraByOwnerUser))
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

        #region ANCILLARY
        private IEnumerable<SharedSpectrumModel>? getSharedSpectra(int userId, Func<int, List<SharedSpectrumModel>?> function)
        {
            List<SharedSpectrumModel>? sharedSpectra = function(userId);
            if (sharedSpectra == null || sharedSpectra.Count == 0)
                return null;

            foreach (var sharedSpectrum in sharedSpectra)
            {
                sharedSpectrum.OwnerUser = dbHandlerHyperLabUsers.getUserDetailsSimple(sharedSpectrum.OwnerUser!.Id);
                sharedSpectrum.SubjectUser = dbHandlerHyperLabUsers.getUserDetailsSimple(sharedSpectrum.SubjectUser!.Id);
            }

            if (sharedSpectra.Any(x => x.AmITheOwner))
                return sharedSpectra.OrderBy(x => x.SubjectUser!.Name).ThenBy(x => x.Filename);
            else
                return sharedSpectra.OrderBy(x => x.Filename);
        }
        #endregion
    }
}
