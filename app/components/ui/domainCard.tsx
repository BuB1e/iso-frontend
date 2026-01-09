import { ChevronRight, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { TDomain, ColorKey } from "~/types/TDomain";
import { Link } from "react-router";

interface DomainCardProps {
  domain: TDomain;
}

enum ProgressStatus {
  Todo = "Todo",
  Inprogress = "In-Progress",
  Done = "Done",
  Total = "Total",
}

const colorStyles: Record<
  ColorKey,
  { bg: string; text: string; gradient: string; border: string }
> = {
  "main-blue": {
    bg: "bg-main-blue/20",
    text: "text-main-blue",
    gradient: "to-main-blue/30",
    border: "border-main-blue",
  },
  green: {
    bg: "bg-green-400/20",
    text: "text-green-800",
    gradient: "to-green-400/30",
    border: "border-green-600",
  },
  yellow: {
    bg: "bg-yellow-400/20",
    text: "text-yellow-800",
    gradient: "to-yellow-400/30",
    border: "border-yellow-600",
  },
  purple: {
    bg: "bg-purple-400/20",
    text: "text-purple-800",
    gradient: "to-purple-400/30",
    border: "border-purple-600",
  },
};

export function DomainCard({ domain }: DomainCardProps) {
  const colors = colorStyles[domain.color];

  return (
    <Link
      to={`/assessment/domain/A${domain.number}`}
      className={`group
			flex flex-col bg-linear-to-br from-white ${colors.gradient} rounded-xl shadow-xl w-full min-h-fit lg:h-[240px] h-[200px]
			border-l-10 ${colors.border} hover:scale-101 transition-all duration-75 hover:shadow-2xl gap-4 hover:cursor-pointer`}
    >
      <Header domain={domain} bgColor={colors.bg} textColor={colors.text} />
      <ProgressStatusRow />
      <ProgressBar current={1} total={37} />
    </Link>
  );
}

function IconWrapper({
  icon: Icon,
  bgColor,
  textColor,
}: {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-sm ${bgColor} p-1`}>
      <Icon className={`w-10 h-10 ${textColor}`} />
    </div>
  );
}

function Topic({
  domain,
  bgColor,
  textColor,
}: {
  domain: TDomain;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-2">
        <div className={`rounded-sm ${bgColor} p-1`}>
          <span className={`text-sm font-bold ${textColor}`}>
            A.{domain.number}
          </span>
        </div>
        <h2 className="text-2xl font-bold">{domain.name}</h2>
      </div>
      <p className="text-sm">{domain.description}</p>
    </div>
  );
}

function Header({
  domain,
  bgColor,
  textColor,
}: {
  domain: TDomain;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className={`flex flex-row items-center justify-between p-4`}>
      <div className="flex flex-row items-center w-fit gap-4">
        <IconWrapper
          icon={domain.icon}
          bgColor={bgColor}
          textColor={textColor}
        />
        <Topic domain={domain} bgColor={bgColor} textColor={textColor} />
      </div>
      <ChevronRight className="w-8 h-8 text-gray-500 group-hover:text-main-blue transition-colors" />
    </div>
  );
}

function ProgressStatusCard({
  progressStatus,
  current,
  total,
}: {
  progressStatus: ProgressStatus;
  current: number;
  total: number;
}) {
  let textColor = "";
  let goal = 0;
  let isTotal = false;
  switch (progressStatus) {
    case ProgressStatus.Todo:
      textColor = "text-main-blue";
      goal = 0;
      break;
    case ProgressStatus.Inprogress:
      textColor = "text-alert-yellow";
      goal = 0;
      break;
    case ProgressStatus.Done:
      textColor = "text-green-600";
      goal = total;
      break;
    case ProgressStatus.Total:
      textColor = "text-gray-600";
      goal = total;
      isTotal = true;
      break;
  }

  return (
    <div
      className={`flex flex-col items-center rounded-xl w-full p-4 bg-white shadow-lg`}
    >
      {isTotal ? (
        <span
          className={`text-xl font-bold ${current == goal ? "text-green-600" : textColor}`}
        >
          {current} / {goal}
        </span>
      ) : (
        <span
          className={`text-xl font-bold ${current == goal ? "text-green-600" : textColor}`}
        >
          {current}
        </span>
      )}
      <span className={`text-xl font-bold ${textColor}`}>{progressStatus}</span>
    </div>
  );
}

// TODO: use real data instead of mock data
function ProgressStatusRow() {
  return (
    <div className="flex flex-row items-center gap-2 w-full px-4">
      <ProgressStatusCard
        progressStatus={ProgressStatus.Todo}
        current={1}
        total={37}
      />
      <ProgressStatusCard
        progressStatus={ProgressStatus.Inprogress}
        current={1}
        total={37}
      />
      <ProgressStatusCard
        progressStatus={ProgressStatus.Done}
        current={1}
        total={37}
      />
      <ProgressStatusCard
        progressStatus={ProgressStatus.Total}
        current={1}
        total={37}
      />
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="flex flex-col items-center px-4 pb-4">
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-linear-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-xs text-gray-500 font-medium">
          {percentage}% Complete
        </span>
      </div>
    </div>
  );
}
