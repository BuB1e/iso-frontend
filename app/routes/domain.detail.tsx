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
      `**Implementation Requirements:**
1. **Develop ISMS Policy**: Create a top-level information security policy approved by management that defines the organization's approach to managing information security.
2. **Define Policy Framework**: Establish a hierarchy of policies covering specific areas (access control, data classification, acceptable use, etc.).
3. **Align with Business**: Ensure policies support business objectives and comply with legal, regulatory, and contractual requirements.
4. **Communicate Policies**: Make policies accessible to all employees and relevant external parties.
5. **Regular Review**: Review and update policies at least annually or when significant changes occur.
6. **Policy Acknowledgment**: Require employees to acknowledge reading and understanding policies.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.2`,
      "Information security roles and responsibilities",
      "All information security responsibilities should be defined and allocated",
      ControlStatus.PARTIALLY,
      `**Implementation Requirements:**
1. **Define Roles**: Clearly define information security roles (CISO, Security Manager, Asset Owners, Custodians, Users).
2. **Document Responsibilities**: Create a RACI matrix for security-related tasks and decisions.
3. **Assign Ownership**: Assign owners for all information assets and security controls.
4. **Include in Job Descriptions**: Incorporate security responsibilities into job descriptions and employment contracts.
5. **Communicate Expectations**: Ensure all staff understand their security responsibilities through training.
6. **Regular Review**: Review role assignments when organizational changes occur.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.3`,
      "Segregation of duties",
      "Conflicting duties and areas of responsibility should be segregated",
      ControlStatus.IMPLEMENTED,
      `**Implementation Requirements:**
1. **Identify Conflicts**: Analyze business processes to identify conflicting duties that could lead to fraud or error.
2. **Separate Critical Functions**: Ensure no single person can authorize, execute, and record a transaction.
3. **Access Controls**: Implement system access controls that enforce segregation of duties.
4. **Compensating Controls**: Where segregation is not possible (small teams), implement additional monitoring and review controls.
5. **Document Exceptions**: Maintain documentation of any exceptions and supporting compensating controls.
6. **Periodic Review**: Regularly audit access rights to ensure segregation is maintained.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.4`,
      "Management responsibilities",
      "Management should require all employees to apply information security policies",
      ControlStatus.NOT_IMPLEMENTED,
      `**Implementation Requirements:**
1. **Leadership Commitment**: Obtain visible commitment from senior management for information security.
2. **Resource Allocation**: Ensure adequate budget and resources for security initiatives.
3. **Set Expectations**: Clearly communicate that security compliance is mandatory for all employees.
4. **Lead by Example**: Ensure management follows security policies themselves.
5. **Performance Metrics**: Include security compliance in performance evaluations.
6. **Regular Updates**: Require management to stay informed about security risks and incidents.
7. **Accountability**: Establish consequences for non-compliance with security policies.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.5`,
      "Contact with authorities",
      "Appropriate contacts with relevant authorities should be maintained",
      ControlStatus.PARTIALLY,
      `**Implementation Requirements:**
1. **Identify Authorities**: List all relevant authorities (law enforcement, regulators, data protection authorities, emergency services).
2. **Establish Contacts**: Maintain up-to-date contact information for each authority.
3. **Define Procedures**: Document when and how to contact authorities (e.g., data breach notification, incident reporting).
4. **Compliance Requirements**: Understand mandatory reporting requirements for your industry.
5. **Relationship Building**: Participate in industry forums and maintain relationships with authorities.
6. **Regular Updates**: Review contact list annually and update as needed.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.6`,
      "Contact with special interest groups",
      "Appropriate contacts with special interest groups should be maintained",
      ControlStatus.NOT_IMPLEMENTED,
      `**Implementation Requirements:**
1. **Identify Groups**: List relevant security forums, professional associations, and vendor groups (ISACs, OWASP, ISACA, etc.).
2. **Membership**: Maintain active memberships in relevant industry groups.
3. **Threat Intelligence**: Subscribe to threat intelligence feeds and security advisories.
4. **Knowledge Sharing**: Participate in information sharing about threats and best practices.
5. **Stay Current**: Attend conferences, webinars, and training to stay updated on security trends.
6. **Document Benefits**: Track valuable intelligence received and actions taken.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.7`,
      "Threat intelligence",
      "Information about technical vulnerabilities should be obtained in a timely fashion",
      ControlStatus.NOT_IMPLEMENTED,
      `**Implementation Requirements:**
1. **Subscribe to Feeds**: Subscribe to vulnerability databases (NVD, CVE), vendor advisories, and threat intelligence services.
2. **Monitor Sources**: Regularly monitor security news, blogs, and mailing lists for emerging threats.
3. **Vulnerability Assessment**: Implement regular vulnerability scanning and penetration testing.
4. **Patch Management**: Establish procedures for timely evaluation and application of security patches.
5. **Risk Assessment**: Evaluate the relevance of vulnerabilities to your environment and prioritize remediation.
6. **Incident Awareness**: Share threat intelligence internally to raise awareness and improve detection.`,
      1,
    ),
    createMockControl(
      `A.${domainNum}.8`,
      "Information security in project management",
      "Information security should be integrated into project management",
      ControlStatus.PARTIALLY,
      `**Implementation Requirements:**
1. **Security in SDLC**: Integrate security requirements into all phases of the project lifecycle.
2. **Security Requirements**: Include security requirements gathering as part of project initiation.
3. **Risk Assessment**: Conduct security risk assessments for all new projects and significant changes.
4. **Security Reviews**: Include security review gates at key project milestones.
5. **Secure Design**: Apply secure design principles (defense in depth, least privilege, fail-safe defaults).
6. **Security Testing**: Include security testing (code review, vulnerability assessment) before deployment.
7. **Documentation**: Ensure security documentation is part of project deliverables.`,
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
