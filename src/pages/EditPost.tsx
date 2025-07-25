
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { salePostService, SalePostUpdateRequest } from '@/services/salePostService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const EditPost = () => {
  const { postPk } = useParams<{ postPk: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryPk: '',
    content: '',
    hopePrice: '',
    latitude: 37.5636,
    longitude: 126.9975
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    if (postPk) {
      fetchPostData();
    }
  }, [postPk, isLoggedIn]);

  const fetchPostData = async () => {
    try {
      const postData = await salePostService.getSalePostDetail(Number(postPk));
      setFormData({
        title: postData.title,
        categoryPk: '1', // 카테고리 매핑 필요
        content: postData.content,
        hopePrice: postData.hopePrice.toString(),
        latitude: postData.latitude,
        longitude: postData.longitude
      });
      setExistingImages(postData.imageUrls || []);
    } catch (error) {
      toast({
        title: '오류',
        description: '게시글 정보를 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
      navigate('/my-posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + newImages.length + files.length;
      
      if (totalImages > 4) {
        toast({
          title: '이미지 제한',
          description: '최대 4개까지만 업로드할 수 있습니다.',
          variant: 'destructive'
        });
        return;
      }
      
      setNewImages(prev => [...prev, ...files]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postPk) return;

    setUpdating(true);

    try {
      // 이미지 URL 배열 생성 (기존 이미지 + 새 이미지 슬롯)
      const imageUrls = [...existingImages];
      
      // 4개까지 빈 문자열로 채우기
      while (imageUrls.length < 4) {
        imageUrls.push('');
      }

      const updateRequest: SalePostUpdateRequest = {
        categoryPk: parseInt(formData.categoryPk),
        title: formData.title,
        content: formData.content,
        hopePrice: parseInt(formData.hopePrice),
        latitude: formData.latitude,
        longitude: formData.longitude,
        imageUrls: imageUrls
      };

      await salePostService.updateSalePost(Number(postPk), updateRequest, newImages);

      toast({
        title: '수정 완료',
        description: '게시글이 성공적으로 수정되었습니다.',
      });

      navigate('/my-posts');
      
    } catch (error) {
      toast({
        title: '수정 실패',
        description: error instanceof Error ? error.message : '게시글 수정에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto p-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-posts')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold ml-4">게시글 수정</h1>
          </div>
          <div className="text-center py-8">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/my-posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-4">게시글 수정</h1>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">상품명 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="상품명을 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoryPk">카테고리 *</Label>
                  <Select onValueChange={(value) => handleInputChange('categoryPk', value)} value={formData.categoryPk}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">식자재</SelectItem>
                      <SelectItem value="2">곡물/잡곡</SelectItem>
                      <SelectItem value="3">채소류</SelectItem>
                      <SelectItem value="4">축산물</SelectItem>
                      <SelectItem value="5">수산물</SelectItem>
                      <SelectItem value="6">과일류</SelectItem>
                      <SelectItem value="7">유제품</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">상품 설명 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="상품 설명을 입력하세요"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="hopePrice">희망 가격 (원) *</Label>
                <Input
                  id="hopePrice"
                  type="number"
                  value={formData.hopePrice}
                  onChange={(e) => handleInputChange('hopePrice', e.target.value)}
                  placeholder="희망 가격"
                  required
                />
              </div>

              {/* 이미지 관리 */}
              <div className="border-t pt-6">
                <Label>상품 이미지 (최대 4개)</Label>
                
                {/* 기존 이미지 */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">기존 이미지</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`기존 이미지 ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 새 이미지 */}
                {newImages.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">새 이미지</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`새 이미지 ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 이미지 업로드 */}
                {(existingImages.length + newImages.length) < 4 && (
                  <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      이미지 추가 ({existingImages.length + newImages.length}/4)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                      파일 선택
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 px-12"
                  disabled={updating}
                >
                  {updating ? '수정 중...' : '수정하기'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPost;
