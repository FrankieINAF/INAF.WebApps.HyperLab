using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.SampleData.Containers;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class ExtServicesController : BaseController
    {
        public ExtServicesController(IServiceProvider serviceProvider) : base(serviceProvider)
        { }

        [HttpGet]
        public async Task<IActionResult> GetMeteorClasses(string Text)
        {
            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            MaterialsContainer meteorClassesContainer = await searchByMaterialHelper.getMeteorClassesAsync(Text);
            if (string.IsNullOrEmpty(meteorClassesContainer.ExMsg))
                return new JsonResult(meteorClassesContainer.Materials);
            else
                return new EmptyResult();
        }
    }
}
