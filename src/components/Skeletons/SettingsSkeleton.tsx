export default function SettingsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 프로필 설정 섹션 스켈레톤 */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="border-b mb-6" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 닉네임 입력 스켈레톤 */}
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>

            {/* 프로필 이미지 스켈레톤 */}
            <div className="flex flex-col items-start">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-2" />
              <div className="h-32 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>

          {/* 버튼 스켈레톤 */}
          <div className="flex justify-end gap-4">
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      {/* 페르소나 설정 섹션 스켈레톤 */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="border-b mb-6" />

        <div className="flex flex-col gap-4 py-4">
          {/* 추가 폼 스켈레톤 */}
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-full md:w-1/3">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="w-full md:w-2/3">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse self-end" />
          </div>

          {/* 페르소나 카드 스켈레톤 */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
