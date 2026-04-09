# HyperLab Technical Report

## 1. Executive Summary

`INAF.WebApps.HyperLab` is an ASP.NET Core web application for managing, searching, visualizing, and sharing spectral data. The solution follows a modular architecture: the web application provides the presentation and orchestration layer, while domain logic, data access, shared models, mathematics, logging, and common helpers are delegated to referenced class libraries.

From the current implementation, HyperLab is best described as a **hybrid ASP.NET Core application**:

- MVC controllers and Razor views are the primary web delivery model.
- Server-side Blazor infrastructure is enabled in the host.
- Static front-end behavior is implemented with bundled JavaScript and CSS assets.
- The application supports both **browser-based access** and **token-based app/API-style access**.

The system is oriented toward scientific workflows, especially spectrum search, chart rendering, processing, and sharing. Authentication, authorization, and token validation are integrated with an external authorization flow and reinforced through application-level filters.

## 2. Solution Scope and Composition

The solution is composed of one main web project and several supporting libraries.

### Main web project

- `INAF.WebApps.HyperLab`

### Referenced solution libraries

- `INAF.Libraries.Net.DB.HyperLab.Data`
- `INAF.Libraries.Net.DB.HyperLab.Users`
- `INAF.Libraries.Net.HyperLab.CommonHelpers`
- `INAF.Libraries.Net.HyperLab.CommonModels`
- `INAF.Libraries.Net.CommonWebAppHelpers`
- `INAF.Libraries.Net.CommonWebAppModels`
- `INAF.Libraries.Net.CommonResources`
- `INAF.Libraries.Net.Extensions`
- `INAF.Libraries.Net.Log`
- `INAF.Libraries.Net.Math`
- `INAF.Libraries.Net.ScienceModels`
- `INAF.Libraries.Net.Parallelization`

This separation indicates a layered design where the web project depends on reusable shared components rather than embedding all logic locally.

## 3. Technology Stack

### Runtime and framework

- `.NET 10` (`TargetFramework: net10.0`)
- `Microsoft.NET.Sdk.Web`
- Nullable reference types enabled
- Implicit global usings enabled

### Web platform

- ASP.NET Core MVC with controllers and views
- Razor view rendering
- Server-side Blazor enabled through `AddServerSideBlazor()` and `MapBlazorHub()`
- Static asset mapping via `MapStaticAssets()` and conventional static files

### Front-end libraries and tooling

- `jQuery`
- `Metro UI`
- `DevExtreme`
- `Luxon`
- Build-time bundling/minification using:
  - `BuildBundlerMinifier`
  - `BundlerMinifier.Core`
  - `BuildWebCompiler`

### Additional packages

- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `Microsoft.AspNetCore.Authentication.OpenIdConnect`
- `Microsoft.AspNetCore.Components.WebAssembly`
- `Microsoft.AspNetCore.Components.WebAssembly.Server`
- `Swashbuckle.AspNetCore` (present, Swagger currently commented out)
- `Newtonsoft.Json`
- `HtmlAgilityPack`
- `Microsoft.Extensions.Logging.Log4Net.AspNetCore`

## 4. Architectural Overview

HyperLab uses a layered application model.

### 4.1 Presentation layer

The presentation layer resides in the `INAF.WebApps.HyperLab` project and includes:

- Controllers under `Controllers\`
- Razor views under `Views\`
- Shared layout and partial views under `Views\Shared\`
- Static assets under `wwwroot\`

The shared layout (`Views\Shared\_Layout.cshtml`) defines the main shell of the application, including:

- a left navigation pane
- a top app bar
- user context rendering
- shared JavaScript and CSS bundles
- a guide container
- a full-screen image container
- a page-cover loading overlay

### 4.2 Application orchestration

Controllers coordinate user requests, session state, permissions, helper services, and data handlers. The common base behavior is centralized in `BaseController`, which provides:

- user identity resolution
- caller context detection (`Web` vs `App`)
- permission retrieval
- encryption/decryption helper access
- common response patterns
- model error aggregation and logging

### 4.3 Data and domain integration

Data access is delegated to specialized handlers:

- `DbHandlerHyperLabData`
- `DbHandlerHyperLabUsers`

Scientific and processing capabilities are delegated to helper libraries such as:

- fit and spline helpers
- continuum removal helpers
- sample type helpers
- chart serialization helpers
- material and search helpers

This keeps the web layer relatively thin and focused on request orchestration.

## 5. Functional Areas

Based on the controller set and view structure, the solution supports the following main capabilities.

### 5.1 Authentication and account management

Implemented mainly in `AccountController`.

Key features include:

- browser login using cookie authentication
- token-based login for app/API consumers
- logout flows
- registration confirmation
- password reset initiation and completion
- account error handling
- token validation checks

The controller stores the user token in session for subsequent validation and uses claims-based cookie sign-in for the browser experience.

### 5.2 Spectra hub and search experience

Implemented mainly in `SpectraManagerController` and related views.

Key features include:

- loading the main spectra hub
- restoring the last search context from session
- loading shared spectra data
- assembling the search page model with authentication and permission context

The hub appears to be the core working area of the application.

### 5.3 Charting and spectrum visualization

Implemented mainly in `ChartsController`.

Key features include:

- navigation to chart view with selected spectra
- retrieval of processed spectrum data by id or parent id
- retrieval of multiple spectra sets
- support for white spectra used in alignment workflows
- loading chart-related panels such as alignment, smoothing, and fit panels

The chart endpoints return JSON or partial views depending on the scenario.

### 5.4 Sharing and collaboration

The solution contains controllers and models related to sharing:

- `SpectraSharesController`
- `SpectraPublicActionsController`
- `UserPublicActionsController`
- `SharedStuff()` flow inside `SpectraManagerController`

This indicates support for owner/subject sharing semantics and collaborative access to spectra.

### 5.5 User, permissions, and administration

Controllers suggest operational areas for:

- user management
- permissions
- user settings
- application catalog/navigation
- materials and sample management

This indicates that HyperLab is not only a visualization portal, but also an administrative and operational platform.

## 6. Request Processing and Runtime Behavior

## 6.1 Hosting configuration

The application is bootstrapped in `Program.cs` using the minimal hosting model.

Notable pipeline components:

- exception handler routed to `/Home/Error`
- development-only developer exception page and WebAssembly debugging
- request localization
- cookie policy
- forwarded headers
- authentication and authorization
- session state
- static file serving, including a custom `.well-known/pki-validation` path
- controller route mapping
- Blazor hub mapping

### 6.2 Localization

The currently configured supported culture is:

- `en`

The publish pipeline also removes satellite resource folders other than `en`, which aligns with the runtime configuration.

### 6.3 Session usage

Session state is backed by in-memory distributed cache.

Session is used for application concerns such as:

- storing the last visited page
- storing the last search payload
- storing the JWT token for browser callers
- caching token expiration information
- storing temporary account error state
- caching resolved app user id in some flows

This is important operationally because it implies sticky or distributed session considerations if the app is deployed across multiple instances.

## 7. Authentication and Security Model

HyperLab uses a mixed authentication strategy.

### 7.1 Dual-mode authentication

The application defines a policy scheme named `JWT_OR_COOKIE`.

Behavior:

- if an `Authorization: Bearer ...` header is present, JWT bearer authentication is used
- otherwise cookie authentication is used

This enables the same application to serve both:

- standard web users
- application or programmatic clients

### 7.2 Cookie authentication

Cookie settings include:

- custom cookie name from application constants
- sliding expiration enabled
- 30-day expiration window
- explicit login, logout, and access denied paths

### 7.3 JWT validation

JWT validation enforces:

- issuer validation
- audience validation
- signing key validation
- lifetime validation
- required expiration

The RSA public key is resolved through `TokenValidationParametersHelper`, while configuration values come from `AppSettings:JwtToken`.

### 7.4 Custom login validity filter

`CheckIsLoginValidAttribute` provides an extra layer beyond standard authentication.

Its behavior includes:

- resolving the current user id
- retrieving token expiration from session when available
- falling back to bearer header, session token, or authorization-service token retrieval
- validating token validity through `AuthorizationHelper`
- redirecting normal requests to login when invalid
- returning `401 Unauthorized` for AJAX/JSON-style requests

This is a meaningful design feature because it handles token freshness explicitly for both interactive pages and asynchronous requests.

### 7.5 Data protection and secrets

The app configures data protection keys at:

- `C:\CommonFiles\keys`

The project also uses:

- `UserSecretsId`
- configuration comments indicating that private keys and sensitive DB connection fragments are expected from user secrets

This keeps sensitive settings out of the repository, although production secret-management strategy should still be reviewed.

## 8. Data Access and Integration

The data layer is abstracted behind dedicated handlers rather than direct EF Core exposure in the web project.

### Main data handlers

- `DbHandlerHyperLabData`: spectra, processed data, shares, search-related retrieval
- `DbHandlerHyperLabUsers`: user identity, roles, permissions, simple user details

### External service integration

The repository contains `MultiAppAuthenticationService`, which posts registration requests to `/api/Account/Register` using `HttpClient`.

The application configuration also includes an `AuthService` section with:

- `ApplicationName`
- `BaseUrl`

This suggests a broader multi-application authentication ecosystem.

## 9. Front-End and User Interface Structure

The UI is primarily server-rendered, with significant client-side enrichment.

### 9.1 Layout structure

The shared layout contains:

- a Metro UI navigation shell
- a dynamic user panel with role-based avatar image selection
- a shared menu partial
- a top app bar with logout action
- a hidden guide area
- a full-screen content viewer
- a loading overlay

### 9.2 Asset organization

Source assets are maintained under:

- `wwwroot\js\src\...`
- `wwwroot\css\src\...`

Compiled assets are emitted under:

- `wwwroot\js\dist\...`
- `wwwroot\css\dist\...`

Bundle groups exist for functional areas such as:

- account
- apps
- chart
- hub
- guide
- materials
- shared stuff
- users
- queue
- metro
- jquery
- devextreme

This organization indicates an application with substantial client-side behavior and clear feature-based asset partitioning.

### 9.3 Blazor position in the UI

Although the host enables Blazor services and hub mapping, the visible application composition is still largely driven by MVC controllers, Razor views, partial views, and JavaScript bundles.

A practical interpretation is that HyperLab is currently a **hybrid host** with Blazor capability available, but not a purely component-driven Blazor front end.

## 10. Build, Packaging, and Publish Characteristics

### 10.1 Build-time asset pipeline

The project uses `bundleconfig.json` for JavaScript and CSS bundling/minification. This is a notable part of the build process because the application references generated bundle files in the shared layout and feature views.

### 10.2 Custom MSBuild targets

The project defines custom targets for:

- copying Metro font files after build
- removing non-English satellite resources after publish

### 10.3 Publish exclusions

The `wwwroot/tiles` subtree is explicitly excluded from publish output.

This indicates an attempt to keep the deployable artifact smaller or to exclude non-runtime assets.

## 11. Configuration Model

The main configuration file contains an `AppSettings` section with the following operational domains:

- `DownloadRootPath`
- `JwtToken`
- `AppPrefixForUserSecrets`
- `ConfirmationToken`
- `DbConnection`
- `AuthService`
- `Log4NetCore`

These settings support identity, token handling, external service communication, logging, and DB connection construction.

## 12. Quality and Maintainability Observations

### Strengths

- Clear modular separation between web layer and supporting libraries
- Reuse of shared helper and model libraries across the solution
- Dual authentication model supports both browser and app consumers
- Centralized base controller reduces repeated infrastructure code
- Explicit session and token validity handling for protected actions
- Organized front-end asset bundles by feature area
- Scientific processing concerns delegated to dedicated libraries

### Potential concerns

- Session uses in-memory storage, which can complicate scale-out deployment
- Data protection keys are bound to a fixed local filesystem path, which must exist in target environments
- Swagger support is referenced but disabled, reducing runtime API discoverability
- The presence of both MVC/Razor and Blazor/WebAssembly packages increases architectural breadth and maintenance surface
- Static asset bundling depends on legacy-style bundling tooling that may require special build-agent setup
- Some logic appears tightly coupled to session state and controller flows, which can complicate future migration toward a more API-first architecture

## 13. Risks and Operational Considerations

### Deployment risks

- `C:\CommonFiles\keys` must be provisioned and writable where data protection is required.
- Session affinity or distributed session infrastructure may be needed in multi-instance deployments.
- External authentication service availability is critical if token acquisition and validation depend on it.
- Bundled static assets must be generated consistently during CI/CD.

### Security considerations

- JWT issuer/audience and RSA key material must remain aligned across environments.
- Cookie and session behavior differs between development and production because secure cookie policy is environment-dependent.
- Sensitive configuration elements are intentionally expected outside the repository and must be managed through secure secret storage.

## 14. Recommended Next Steps

1. Add or re-enable API documentation for externally consumed endpoints where appropriate.
2. Document the external authentication dependency and token lifecycle more explicitly for operators.
3. Evaluate distributed cache/session storage if horizontal scaling is planned.
4. Externalize the data-protection key path and other machine-specific paths into environment-specific configuration.
5. Review whether the current hybrid MVC/Blazor composition should remain hybrid or be simplified over time.
6. Add a repository-level architecture diagram and deployment diagram to complement this report.
7. Formalize CI/CD steps for bundle generation, publish exclusions, and environment provisioning.

## 15. Conclusion

HyperLab is a mature, feature-rich scientific web platform centered on spectral data workflows. Its architecture combines a server-rendered ASP.NET Core application, strong library reuse, feature-oriented front-end bundles, and a dual authentication strategy that serves both interactive users and non-browser clients.

The solution shows good modularity and a clear domain focus. Its main technical priorities going forward should be operational hardening, deployment standardization, and continued documentation of the hybrid runtime model and authentication ecosystem.

---

## Appendix A - Main Web Project Areas

### Controllers

Key controller areas identified in the web project include:

- `AccountController`
- `AppsController`
- `ChartsController`
- `HomeController`
- `MaterialsController`
- `PermissionsController`
- `SampleAndMeasurementController`
- `SpectraFilesController`
- `SpectraManagerController`
- `SpectraPublicActionsController`
- `SpectraSharesController`
- `UserPublicActionsController`
- `UserSettingsController`
- `UsersController`
- `SearchesController`

### Supporting application code

- `Attributes\`
- `Helpers\`
- `Extensions\`
- `Models\`
- `Resources\`
- `Values\`
- `ExternalServices\`

### UI assets

- `Views\`
- `wwwroot\js\src`
- `wwwroot\js\dist`
- `wwwroot\css\src`
- `wwwroot\css\dist`
