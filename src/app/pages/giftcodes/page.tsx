"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "sonner";
import GiftcodeDrawer from "./GiftcodeDrawer";
import { Item } from "../../handler/apiItems";
import { Giftcode, apiGiftcode } from "../../handler/apiGiftcodes";
import { apiItems } from "../../handler/apiItems";
import { apiOptions, ItemOption } from "../../handler/apiOptions";
export default function ManageGiftcodes() {
    const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedGiftcode, setSelectedGiftcode] = useState<Giftcode | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [giftcodeRes, itemRes, optionRes] = await Promise.all([
                    apiGiftcode.getList(),
                    apiItems.getList(),
                    apiOptions.getList(),
                ]);
                setGiftcodes(giftcodeRes?.payload || []);
                setItems(itemRes?.payload || []);
                setItemOptions(optionRes?.payload || []);
            } catch (err) {
                const fetchErrorMsg = "Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.";
                setError(fetchErrorMsg);
                toast.error("Lỗi tải dữ liệu", { description: fetchErrorMsg });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDrawerSubmit = async (data: { code: string; count: number; expired: string; detail: any[] }) => {
        setLoading(true);
        setError(null);
        try {
            if (selectedGiftcode) {
                await apiGiftcode.update(selectedGiftcode.id, data);
                toast.success("Giftcode đã được cập nhật thành công!");
            } else {
                await apiGiftcode.create(data);
                toast.success("Giftcode đã được tạo mới thành công!");
            }
            const response = await apiGiftcode.getList();
            setGiftcodes(response?.payload || []);
            setOpenDrawer(false);
        } catch (err: any) {
            const errorMessage = err.message || "Lỗi khi lưu giftcode. Vui lòng kiểm tra lại thông tin.";
            setError(errorMessage);
            toast.error("Lỗi lưu giftcode", { description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa giftcode này không?")) return;
        setLoading(true);
        setError(null);
        try {
            await apiGiftcode.delete(id);
            setGiftcodes(giftcodes.filter((g) => g.id !== id));
            toast.success("Giftcode đã được xóa thành công.");
        } catch (err: any) {
            const errorMessage = err.message || "Lỗi khi xóa giftcode.";
            setError(errorMessage);
            toast.error("Lỗi xóa giftcode", { description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const openCreateDrawer = () => {
        setSelectedGiftcode(null);
        setOpenDrawer(true);
    };

    const openEditDrawer = (giftcode: Giftcode) => {
        setSelectedGiftcode(giftcode);
        setOpenDrawer(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">Quản lý Giftcode</CardTitle>
                        <CardDescription>Thêm mới, chỉnh sửa hoặc xóa giftcode.</CardDescription>
                    </div>
                    <Button onClick={openCreateDrawer} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-5 w-5 mr-2" /> Thêm Giftcode
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading && giftcodes.length === 0 && !error && (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="ml-3 text-lg text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    )}
                    {error && !loading && ( // Chỉ hiển thị lỗi div nếu không còn loading chính
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                            <p className="font-bold">Lỗi</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {!loading && !error && giftcodes.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-xl text-gray-500">Không có giftcode nào.</p>
                            <p className="text-gray-400 mt-2">Hãy bắt đầu bằng cách thêm giftcode mới!</p>
                        </div>
                    )}
                    {!loading && giftcodes.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableCaption className="py-3 text-sm text-gray-500">
                                    Danh sách các giftcode hiện có trong hệ thống.
                                </TableCaption>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">ID</TableHead>
                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</TableHead>
                                        <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt nhập</TableHead>
                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</TableHead>
                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hết hạn</TableHead>
                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</TableHead>
                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">Vật phẩm</TableHead>
                                        <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-200">
                                    {giftcodes.map((giftcode) => (
                                        <TableRow key={giftcode.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{giftcode.id}</TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">{giftcode.code}</TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{giftcode.count_left}/{giftcode.count}</TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{format(new Date(giftcode.datecreate), "dd/MM/yyyy HH:mm")}</TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{format(new Date(giftcode.expired), "dd/MM/yyyy HH:mm")}</TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                <Badge variant={giftcode.type === "one_time" ? "default" : "secondary"}>
                                                    {giftcode.type === "one_time" ? "Dùng 1 lần" : giftcode.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm text-gray-700">
                                                {giftcode.detail?.length ? (
                                                    <div className="space-y-2">
                                                        {giftcode.detail.map((d, idx) => {
                                                            const item = items.find(i => i.id === d.temp_id);
                                                            return (
                                                                <div key={idx} className="p-2 border rounded-md bg-gray-50">
                                                                    <div className="font-semibold text-gray-800">
                                                                        {item?.NAME || `Item ID: ${d.temp_id}`}
                                                                        <span className="font-normal text-gray-600"> × {d.quantity}</span>
                                                                    </div>
                                                                    {d.options?.length > 0 && (
                                                                        <div className="mt-1 space-x-1 space-y-1">
                                                                            {d.options.map((opt, i) => {
                                                                                const optMeta = itemOptions.find(o => o.id === opt.id);
                                                                                return (
                                                                                    <>
                                                                                        <Badge key={i} variant="outline" className="text-xs">
                                                                                            {optMeta
                                                                                                ? `${optMeta.NAME.split('#')[0] || 'Option'}: +${opt.param}`
                                                                                                : `ID: ${opt.id}, Val: ${opt.param}`}
                                                                                        </Badge>

                                                                                    </>



                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">Không có vật phẩm</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDelete(giftcode.id)}
                                                    className="bg-red-500 p-2 hover:bg-red-700"
                                                    title="Xóa"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                {giftcodes.length > 0 && (
                    <CardFooter className="text-sm text-gray-500 py-3 px-4 md:px-6 border-t">
                        Tổng cộng có {giftcodes.length} giftcode.
                    </CardFooter>
                )}
            </Card>

            {openDrawer && (
                <GiftcodeDrawer
                    open={openDrawer}
                    items={items}
                    itemOptions={itemOptions}
                    setOpen={setOpenDrawer}
                    giftcode={selectedGiftcode}
                    onSubmit={handleDrawerSubmit}
                />
            )}
        </div>
    );
}