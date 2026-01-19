import { useParams } from "react-router";
import {
  ControlItem,
  createMockControl,
  createMockAssessmentControl,
} from "~/components/ui/controlItem";
import {
  ControlStatus,
  ControlsType,
  controlsTypeDomainMap,
  controlsTypeNameMap,
  controlsTypeColorMap,
  type TControl,
  type TAssessmentControl,
} from "~/types";

// Map domain number to ControlsType
const domainNumberToType: Record<string, ControlsType> = {
  A5: ControlsType.ORGANIZATION,
  A6: ControlsType.PEOPLE,
  A7: ControlsType.PHYSICAL,
  A8: ControlsType.TECHNOLOGICAL,
};

// TODO: Replace with API call to fetch controls for this domain
function getMockControls(domainType: ControlsType): TControl[] {
  const domainNum = controlsTypeDomainMap[domainType];
  return [
    createMockControl(
      `A.${domainNum}.1`,
      "Policies for information security",
      "Management direction and support for information security in accordance with business requirements",
      ControlStatus.NOT_IMPLEMENTED,
      1,
    ),
    createMockControl(
      `A.${domainNum}.2`,
      "Information security roles and responsibilities",
      "All information security responsibilities should be defined and allocated",
      ControlStatus.PARTIALLY,
      1,
    ),
    createMockControl(
      `A.${domainNum}.3`,
      "Segregation of duties",
      "Conflicting duties and areas of responsibility should be segregated",
      ControlStatus.IMPLEMENTED,
      1,
    ),
    createMockControl(
      `A.${domainNum}.4`,
      "Management responsibilities",
      "Management should require all employees to apply information security policies",
      ControlStatus.NOT_IMPLEMENTED,
      1,
    ),
    createMockControl(
      `A.${domainNum}.5`,
      "Contact with authorities",
      "Appropriate contacts with relevant authorities should be maintained",
      ControlStatus.PARTIALLY,
      1,
    ),
    createMockControl(
      `A.${domainNum}.6`,
      "Contact with special interest groups",
      "Appropriate contacts with special interest groups should be maintained",
      ControlStatus.NOT_IMPLEMENTED,
      1,
    ),
    createMockControl(
      `A.${domainNum}.7`,
      "Threat intelligence",
      "Information about technical vulnerabilities should be obtained in a timely fashion",
      ControlStatus.NOT_IMPLEMENTED,
      1,
    ),
    createMockControl(
      `A.${domainNum}.8`,
      "Information security in project management",
      "Information security should be integrated into project management",
      ControlStatus.PARTIALLY,
      1,
    ),
  ];
}

export default function DomainDetail() {
  const { domainNumber } = useParams();
  const domainType =
    domainNumberToType[domainNumber as string] || ControlsType.ORGANIZATION;

  // TODO: Fetch from API
  const controls = getMockControls(domainType);
  const assessmentControl = createMockAssessmentControl(
    domainType,
    controls.filter((c) => c.status === ControlStatus.IMPLEMENTED).length,
    controls.length,
  );

  const domainName = controlsTypeNameMap[domainType];
  const domainNum = controlsTypeDomainMap[domainType];

  // Calculate progress stats
  const implemented = controls.filter(
    (c) => c.status === ControlStatus.IMPLEMENTED,
  ).length;
  const partial = controls.filter(
    (c) => c.status === ControlStatus.PARTIALLY,
  ).length;
  const notImplemented = controls.filter(
    (c) => c.status === ControlStatus.NOT_IMPLEMENTED,
  ).length;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-main-blue/10 text-main-blue font-bold rounded text-sm">
            A.{domainNum}
          </span>
          <h1 className="text-xl font-bold text-slate-800">{domainName}</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Review and assess the implementation status of each control in this
          domain.
        </p>

        {/* Progress Summary */}
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-slate-600">
              {implemented} Implemented
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-slate-600">{partial} Partially</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-slate-600">
              {notImplemented} Not Implemented
            </span>
          </div>
        </div>
      </div>

      {/* Controls List */}
      <div className="flex flex-col gap-3 w-full">
        {controls.map((control) => (
          <ControlItem
            key={control.code}
            control={control}
            assessmentControl={assessmentControl}
          />
        ))}
      </div>
    </div>
  );
}
