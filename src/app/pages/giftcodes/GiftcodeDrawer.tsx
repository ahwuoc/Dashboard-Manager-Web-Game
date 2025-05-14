"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter, // Thêm DrawerFooter
    DrawerDescription, // Thêm DrawerDescription
    DrawerClose // Thêm DrawerClose
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Thêm ScrollArea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Thêm Card
import { Badge } from "@/components/ui/badge"; // Thêm Badge
import { Trash2, Search, PlusCircle, X, Loader2, AlertCircle } from "lucide-react"; // Thêm icons
import { format, parseISO } from "date-fns";
import { Giftcode } from "../../handler/apiGiftcodes";
import { ItemOption, apiOptions } from "../../handler/apiOptions";
import { apiItems, Item } from "../../handler/apiItems";

export interface GiftcodeDrawerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    giftcode: Giftcode | null;
    onSubmit: (data: {
        code: string;
        count: number; // Sửa lại type cho count
        expired: string;
        detail: { temp_id: number; quantity: number; options: { param: number; id: number }[] }[];
    }) => Promise<void>;
    items: Item[]; // Nhận từ component cha
    itemOptions: ItemOption[]; // Nhận từ component cha
}

interface NewItemState {
    temp_id: number | null;
    temp_name?: string; // Lưu tên item để hiển thị
    quantity: number;
    options: { id: number; param: number; name?: string }[]; // Lưu tên option
}

export default function GiftcodeDrawer({
    open,
    setOpen,
    giftcode,
    onSubmit,
    items: allItems, // Đổi tên để tránh nhầm lẫn với items trong state cục bộ nếu có
    itemOptions: allItemOptions,
}: GiftcodeDrawerProps) {
    const [formData, setFormData] = useState({
        code: "",
        count: 1, // Mặc định là 1
        expired: "",
    });
    const [selectedItems, setSelectedItems] = useState<
        { temp_id: number; quantity: number; options: { id: number; param: number }[] }[]
    >([]);

    const [itemSearch, setItemSearch] = useState("");
    const [optionSearch, setOptionSearch] = useState(""); // Để tìm kiếm option cho item hiện tại
    const [searchedApiItems, setSearchedApiItems] = useState<Item[]>([]); // Kết quả từ API items
    const [searchedApiOptions, setSearchedApiOptions] = useState<ItemOption[]>([]); // Kết quả từ API options

    const [isSearchingItems, setIsSearchingItems] = useState(false);
    const [isSearchingOptions, setIsSearchingOptions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const [newItem, setNewItem] = useState<NewItemState>({
        temp_id: null,
        temp_name: "",
        quantity: 1,
        options: [],
    });

    // Effect để khởi tạo form data khi giftcode thay đổi (lúc edit)
    useEffect(() => {
        if (giftcode) {
            setFormData({
                code: giftcode.code,
                count: giftcode.count_left, // Hoặc giftcode.count tùy theo logic
                expired: giftcode.expired ? format(parseISO(giftcode.expired), "yyyy-MM-dd") : "",
            });
            // Chuyển đổi detail của giftcode để hiển thị tên
            const detailedItems = giftcode.detail?.map(d => ({
                ...d,
                temp_name: allItems.find(i => i.id === d.temp_id)?.NAME || `ID: ${d.temp_id}`,
                options: d.options.map(opt => ({
                    ...opt,
                    name: allItemOptions.find(o => o.id === opt.id)?.NAME.split('#')[0] || `ID: ${opt.id}`
                }))
            })) || [];
            setSelectedItems(detailedItems);
        } else {
            // Reset form cho trường hợp "Tạo mới"
            setFormData({ code: "", count: 1, expired: "" });
            setSelectedItems([]);
            setNewItem({ temp_id: null, temp_name: "", quantity: 1, options: [] });
        }
        setError(null); // Reset lỗi khi mở drawer
    }, [giftcode, open, allItems, allItemOptions]);


    const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        return (...args: Parameters<F>): Promise<ReturnType<F>> =>
            new Promise(resolve => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => resolve(func(...args)), waitFor);
            });
    };

    const searchItemAPI = async (value: string) => {
        if (!value.trim()) {
            setSearchedApiItems([]);
            setIsSearchingItems(false);
            return;
        }
        setIsSearchingItems(true);
        try {
            const response = await apiItems.search(value);
            setSearchedApiItems(response?.payload || []);
        } catch (e) {
            console.error("Item search error:", e);
            setSearchedApiItems([]);
        } finally {
            setIsSearchingItems(false);
        }
    };

    const searchOptionAPI = async (value: string) => {
        if (!value.trim()) {
            setSearchedApiOptions([]);
            setIsSearchingOptions(false);
            return;
        }
        setIsSearchingOptions(true);
        try {
            const response = await apiOptions.search(value);
            setSearchedApiOptions(response?.payload || []);
        } catch (e) {
            console.error("Option search error:", e);
            setSearchedApiOptions([]);
        } finally {
            setIsSearchingOptions(false);
        }
    };

    const debouncedSearchItem = useCallback(debounce(searchItemAPI, 300), []);
    const debouncedSearchOption = useCallback(debounce(searchOptionAPI, 300), []);

    useEffect(() => {
        debouncedSearchItem(itemSearch);
    }, [itemSearch, debouncedSearchItem]);

    useEffect(() => {
        debouncedSearchOption(optionSearch);
    }, [optionSearch, debouncedSearchOption]);


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "count" ? parseInt(value) || 0 : value }));
    };

    const handleItemSelect = (item: Item) => {
        setNewItem((prev) => ({ ...prev, temp_id: item.id, temp_name: item.NAME, options: [] })); // Reset options khi chọn item mới
        setItemSearch(""); // Xóa input search
        setSearchedApiItems([]); // Xóa danh sách kết quả
    };

    const handleOptionSelect = (option: ItemOption, itemIndex?: number) => { // itemIndex để chỉnh sửa option của item đã thêm
        const newOption = { id: option.id, param: 0, name: option.NAME.split('#')[0] || `ID: ${option.id}` };
        if (typeof itemIndex === 'number') { // Thêm/Sửa option cho item trong selectedItems
            const updatedSelectedItems = [...selectedItems];
            if (!updatedSelectedItems[itemIndex].options.find(o => o.id === option.id)) {
                updatedSelectedItems[itemIndex].options.push({ id: option.id, param: 0 }); // Chỉ id và param
                setSelectedItems(updatedSelectedItems);
            }
        } else { // Thêm option cho newItem
            if (!newItem.options.find(o => o.id === option.id)) {
                setNewItem((prev) => ({
                    ...prev,
                    options: [...prev.options, newOption],
                }));
            }
        }
        setOptionSearch("");
        setSearchedApiOptions([]);
    };


    const handleNewItemQuantityChange = (value: string) => {
        setNewItem((prev) => ({ ...prev, quantity: parseInt(value) || 1 }));
    };

    const handleNewItemOptionParamChange = (optionIndex: number, value: string) => {
        const updatedOptions = [...newItem.options];
        updatedOptions[optionIndex].param = parseInt(value) || 0;
        setNewItem((prev) => ({ ...prev, options: updatedOptions }));
    };

    const removeNewItemOption = (optionIndex: number) => {
        setNewItem((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== optionIndex),
        }));
    };

    const addItemToGiftcode = () => {
        if (newItem.temp_id !== null && newItem.quantity > 0) {
            // Chỉ lưu id và param cho options, không lưu name vào data gửi đi
            const itemToAdd = {
                temp_id: newItem.temp_id,
                quantity: newItem.quantity,
                options: newItem.options.map(opt => ({ id: opt.id, param: opt.param }))
            };
            setSelectedItems((prev) => [...prev, itemToAdd]);
            // Reset newItem để chuẩn bị cho item tiếp theo
            setNewItem({ temp_id: null, temp_name: "", quantity: 1, options: [] });
            setItemSearch(""); // Reset luôn cả search input
        } else {
            setError("Vui lòng chọn một vật phẩm và nhập số lượng hợp lệ.");
        }
    };

    const removeSelectedItem = (index: number) => {
        setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSelectedItemOptionParamChange = (itemIndex: number, optionIndex: number, value: string) => {
        const updatedSelectedItems = [...selectedItems];
        updatedSelectedItems[itemIndex].options[optionIndex].param = parseInt(value) || 0;
        setSelectedItems(updatedSelectedItems);
    };

    const removeSelectedOptionFromItem = (itemIndex: number, optionId: number) => {
        const updatedSelectedItems = [...selectedItems];
        updatedSelectedItems[itemIndex].options = updatedSelectedItems[itemIndex].options.filter(opt => opt.id !== optionId);
        setSelectedItems(updatedSelectedItems);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.code.trim()) {
            setError("Mã giftcode không được để trống.");
            return;
        }
        if (formData.count <= 0) {
            setError("Số lượt nhập phải lớn hơn 0.");
            return;
        }
        if (!formData.expired) {
            setError("Ngày hết hạn không được để trống.");
            return;
        }
        if (selectedItems.length === 0) {
            setError("Giftcode phải có ít nhất một vật phẩm.");
            return;
        }


        setIsSubmitting(true);
        const dataToSubmit = {
            ...formData,
            // Đảm bảo 'detail' có cấu trúc đúng như API mong đợi
            detail: selectedItems.map(item => ({
                temp_id: item.temp_id,
                quantity: item.quantity,
                options: item.options.map(opt => ({ id: opt.id, param: opt.param })), // Chỉ gửi id và param
            })),
        };

        try {
            await onSubmit(dataToSubmit);
            // setOpen(false); // Component cha sẽ đóng drawer
        } catch (apiError: any) {
            setError(apiError.message || "Đã có lỗi xảy ra khi lưu giftcode.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right"> {/* Drawer từ phải qua */}
            <DrawerContent className="w-full md:w-2/5 h-full max-w-2xl rounded-l-2xl bg-gray-50 flex flex-col">
                {/* Thêm class flex flex-col */}
                <DrawerHeader className="bg-white shadow-sm p-4 border-b">
                    <div className="flex justify-between items-center">
                        <DrawerTitle className="text-xl font-semibold text-gray-800">
                            {giftcode ? "Chỉnh sửa Giftcode" : "Tạo Giftcode Mới"}
                        </DrawerTitle>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                    {giftcode && <DrawerDescription className="text-sm text-gray-500 mt-1">Sửa thông tin cho giftcode: {giftcode.code}</DrawerDescription>}
                </DrawerHeader>

                <ScrollArea className="flex-grow p-6 space-y-6"> {/* ScrollArea bao bọc nội dung chính */}
                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start" role="alert">
                            <AlertCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold">Lỗi! </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thông tin chung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="code" className="text-sm font-medium text-gray-700">Mã Giftcode <span className="text-red-500">*</span></Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleFormChange}
                                    placeholder="Ví dụ: TET2025"
                                    className="bg-white"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="count" className="text-sm font-medium text-gray-700">Lượt nhập <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="count"
                                        name="count"
                                        type="number"
                                        min="1"
                                        value={formData.count}
                                        onChange={handleFormChange}
                                        placeholder="Số lượt"
                                        className="bg-white"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="expired" className="text-sm font-medium text-gray-700">Ngày hết hạn <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="expired"
                                        name="expired"
                                        type="date"
                                        value={formData.expired}
                                        onChange={handleFormChange}
                                        className="bg-white"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thêm vật phẩm vào Giftcode</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Item Selection */}
                            <div className="space-y-1">
                                <Label htmlFor="itemSearch" className="text-sm font-medium text-gray-700">Tìm & Chọn Item <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="itemSearch"
                                        type="text"
                                        placeholder="Nhập tên item để tìm..."
                                        value={newItem.temp_id ? (allItems.find(i => i.id === newItem.temp_id)?.NAME || `Item ID: ${newItem.temp_id}`) : itemSearch}
                                        onChange={(e) => {
                                            if (newItem.temp_id) { // Nếu đã chọn item, xóa đi để tìm mới
                                                setNewItem(prev => ({ ...prev, temp_id: null, temp_name: "", options: [] }));
                                            }
                                            setItemSearch(e.target.value);
                                        }}
                                        className="bg-white pr-10"
                                        disabled={isSubmitting || !!newItem.temp_id} // Disable nếu đã chọn item
                                    />
                                    {newItem.temp_id ? (
                                        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={() => { setNewItem(prev => ({ ...prev, temp_id: null, temp_name: "", options: [] })); setItemSearch(''); }}>
                                            <X className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    ) : (
                                        isSearchingItems ? <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={20} />
                                            : <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    )}
                                </div>
                                {searchedApiItems.length > 0 && !newItem.temp_id && (
                                    <div className="bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto shadow-lg z-10 mt-1">
                                        {searchedApiItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-2 hover:bg-indigo-100 cursor-pointer transition-colors text-sm"
                                                onClick={() => handleItemSelect(item)}
                                            >
                                                {item.NAME} (ID: {item.id})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quantity for New Item */}
                            {newItem.temp_id && (
                                <div className="space-y-1">
                                    <Label htmlFor="newItemQuantity" className="text-sm font-medium text-gray-700">Số lượng Item <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="newItemQuantity"
                                        type="number"
                                        min="1"
                                        placeholder="Số lượng"
                                        value={newItem.quantity}
                                        onChange={(e) => handleNewItemQuantityChange(e.target.value)}
                                        className="bg-white"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            )}

                            {/* Option Selection for New Item */}
                            {newItem.temp_id && (
                                <div className="space-y-3 p-3 border rounded-md bg-gray-100">
                                    <Label className="text-sm font-medium text-gray-700">Thêm Options cho: <span className="font-semibold">{newItem.temp_name}</span></Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Tìm tên option..."
                                            value={optionSearch}
                                            onChange={(e) => setOptionSearch(e.target.value)}
                                            className="bg-white pr-10"
                                            disabled={isSubmitting}
                                        />
                                        {isSearchingOptions ? <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={20} />
                                            : <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />}
                                    </div>
                                    {searchedApiOptions.length > 0 && (
                                        <div className="bg-white border border-gray-300 rounded-md max-h-32 overflow-y-auto shadow-lg z-10 mt-1">
                                            {searchedApiOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="p-2 hover:bg-indigo-100 cursor-pointer transition-colors text-sm"
                                                    onClick={() => handleOptionSelect(option)} // Sẽ thêm vào newItem
                                                >
                                                    {option.NAME.split('#')[0] || `Option ID: ${option.id}`}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {newItem.options.length > 0 && <p className="text-xs text-gray-600 mt-2">Chỉnh sửa param cho các option đã thêm:</p>}
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {newItem.options.map((opt, index) => (
                                            <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded shadow-sm">
                                                <span className="text-sm text-gray-800 flex-grow">
                                                    {opt.name || allItemOptions.find(o => o.id === opt.id)?.NAME.split('#')[0] || `Option ID: ${opt.id}`}
                                                </span>
                                                <Input
                                                    type="number"
                                                    placeholder="Param"
                                                    value={opt.param}
                                                    onChange={(e) => handleNewItemOptionParamChange(index, e.target.value)}
                                                    className="w-24 bg-white text-black border-gray-300 focus:ring-indigo-500 text-sm"
                                                    disabled={isSubmitting}
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeNewItemOption(index)} disabled={isSubmitting} title="Xóa option này">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button onClick={addItemToGiftcode} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!newItem.temp_id || newItem.quantity <= 0 || isSubmitting}>
                                <PlusCircle className="h-5 w-5 mr-2" /> Thêm Item vào Giftcode
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Selected Items List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Vật phẩm trong Giftcode ({selectedItems.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedItems.length === 0 ? (
                                <p className="text-sm text-center text-gray-500 py-4">Chưa có vật phẩm nào được thêm.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedItems.map((sItem, itemIdx) => {
                                        const itemMeta = allItems.find((i) => i.id === sItem.temp_id);
                                        return (
                                            <div key={itemIdx} className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-md text-indigo-700">
                                                            {itemMeta?.NAME || `Item ID: ${sItem.temp_id}`}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">Số lượng: {sItem.quantity}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeItem(itemIdx)} disabled={isSubmitting} title="Xóa Item này khỏi Giftcode">
                                                        <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800" />
                                                    </Button>
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    <Label className="text-xs font-medium text-gray-500 uppercase">Options:</Label>
                                                    {sItem.options.length > 0 ? (
                                                        sItem.options.map((opt, optIdx) => {
                                                            const optMeta = allItemOptions.find(o => o.id === opt.id);
                                                            return (
                                                                <div key={optIdx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                                                    <span className="text-sm text-gray-700 flex-grow">
                                                                        {optMeta?.NAME.split('#')[0] || `Option ID: ${opt.id}`}
                                                                    </span>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Param"
                                                                        value={opt.param}
                                                                        onChange={(e) => handleSelectedItemOptionParamChange(itemIdx, optIdx, e.target.value)}
                                                                        className="w-20 bg-white text-sm"
                                                                        disabled={isSubmitting}
                                                                    />
                                                                    <Button variant="ghost" size="icon" onClick={() => removeSelectedOptionFromItem(itemIdx, opt.id)} disabled={isSubmitting} title="Xóa option này">
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })
                                                    ) : <p className="text-xs text-gray-400 italic">Không có option.</p>}
                                                    {/* Nút thêm option cho item đã chọn (nếu cần) */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </ScrollArea>

                <DrawerFooter className="p-4 border-t bg-white">
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        type="button" // Sửa thành "button" vì form có onSubmit riêng
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedItems.length === 0}
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {giftcode ? "Lưu thay đổi" : "Tạo Giftcode"}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full" disabled={isSubmitting}>Hủy</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}